const authModel = require('../models/authModel');
const ProductModel = require('../models/productsModel');
const CategoryModel = require('../models/categoryModel');

// ===== VALIDATION UTILS =====
const ValidationUtils = {
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    isValidPhone: (phone) => /^[0-9]{9,10}$/.test(phone),
    isValidUsername: (username) => /^[a-zA-Z0-9_]{3,50}$/.test(username),
    isValidPassword: (password) => password && password.length >= 8 && password.length <= 100,
    sanitize: (input) => (typeof input === 'string' ? input.trim() : ''),
};

// ===== RENDER HELPER =====
async function renderHomeWithData(res, templateData = {}) {
    try {
        const productsResult = await ProductModel.getAll();
        const slides = productsResult.rows.map((product) => ({
            id: product.id,
            image: product.image,
            name: product.name,
            description: product.description,
            price: product.price,
        }));

        const trending = await ProductModel.getTrendingSofas(12);
        const categoriesResult = await CategoryModel.getOverview();
        const categories = categoriesResult.rows;

        return res.render('home', {
            slides,
            trendingProducts: trending.rows,
            categoriesTop: categories.slice(0, 3),
            categoriesBottom: categories.slice(3, 5),
            ...templateData,
        });
    } catch (err) {
        console.error('Error rendering home:', err);
        return res.render('home', {
            slides: [],
            trendingProducts: [],
            categoriesTop: [],
            categoriesBottom: [],
            ...templateData,
        });
    }
}

class AuthController {
    async login(req, res) {
        try {
            let { username, password } = req.body;

            // Sanitize inputs
            username = ValidationUtils.sanitize(username);
            password = ValidationUtils.sanitize(password);

            // Validate inputs
            if (!username || !password) {
                return renderHomeWithData(res, {
                    loginError: 'Tên người dùng và mật khẩu không được để trống',
                    showAuthModal: true,
                    activeTab: 'login',
                });
            }

            if (!ValidationUtils.isValidUsername(username)) {
                return renderHomeWithData(res, {
                    loginError: 'Tên người dùng không hợp lệ',
                    showAuthModal: true,
                    activeTab: 'login',
                });
            }

            if (!ValidationUtils.isValidPassword(password)) {
                return renderHomeWithData(res, {
                    loginError: 'Mật khẩu không hợp lệ',
                    showAuthModal: true,
                    activeTab: 'login',
                });
            }

            // Query database
            const result = await authModel.login(username, password);

            if (result.rows.length === 0) {
                return renderHomeWithData(res, {
                    loginError: 'Tên người dùng hoặc mật khẩu không đúng',
                    showAuthModal: true,
                    activeTab: 'login',
                });
            }

            const user = result.rows[0];

            // LƯU SESSION
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role,
            };

            if (user.role === 'admin') {
                return res.redirect('/admin/products');
            }

            return res.redirect('/');
        } catch (err) {
            console.error('Login error:', err);
            return renderHomeWithData(res, {
                loginError: 'Có lỗi xảy ra, vui lòng thử lại',
                showAuthModal: true,
                activeTab: 'login',
            });
        }
    }

    async register(req, res) {
        try {
            let { username, email, phone, password, confirmPassword } = req.body;

            // Sanitize inputs
            username = ValidationUtils.sanitize(username);
            email = ValidationUtils.sanitize(email);
            phone = ValidationUtils.sanitize(phone);
            password = ValidationUtils.sanitize(password);
            confirmPassword = ValidationUtils.sanitize(confirmPassword);

            // Validate inputs
            if (!username || !email || !phone || !password || !confirmPassword) {
                return renderHomeWithData(res, {
                    registerError: 'Tất cả các trường không được để trống',
                    showAuthModal: true,
                    activeTab: 'register',
                });
            }

            if (!ValidationUtils.isValidUsername(username)) {
                return renderHomeWithData(res, {
                    registerError: 'Tên người dùng phải từ 3-50 ký tự, chỉ chứa chữ, số và dấu gạch dưới',
                    showAuthModal: true,
                    activeTab: 'register',
                });
            }

            if (!ValidationUtils.isValidEmail(email)) {
                return renderHomeWithData(res, {
                    registerError: 'Email không hợp lệ',
                    showAuthModal: true,
                    activeTab: 'register',
                });
            }

            if (!ValidationUtils.isValidPhone(phone)) {
                return renderHomeWithData(res, {
                    registerError: 'Số điện thoại phải từ 9-10 chữ số',
                    showAuthModal: true,
                    activeTab: 'register',
                });
            }

            if (!ValidationUtils.isValidPassword(password)) {
                return renderHomeWithData(res, {
                    registerError: 'Mật khẩu phải có ít nhất 8 ký tự',
                    showAuthModal: true,
                    activeTab: 'register',
                });
            }

            if (password !== confirmPassword) {
                return renderHomeWithData(res, {
                    registerError: 'Mật khẩu xác nhận không khớp',
                    showAuthModal: true,
                    activeTab: 'register',
                });
            }

            // Always set role to 'client' - prevent privilege escalation
            const values = [username, email, phone, password, 'client'];

            await authModel.register(values);
            console.log('✅ Registration successful:', { username, email, phone, role: 'client' });

            return renderHomeWithData(res, {
                registerSuccess: 'Đăng ký thành công! Vui lòng đăng nhập',
                showAuthModal: true,
                activeTab: 'login',
            });
        } catch (error) {
            console.error('❌ Registration error:', error);

            let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';

            if (error.message.includes('duplicate') || error.code === '23505') {
                errorMessage = 'Tên người dùng hoặc email đã tồn tại';
            } else if (error.message.includes('unique')) {
                errorMessage = 'Tên người dùng hoặc email đã tồn tại';
            }

            return renderHomeWithData(res, {
                registerError: errorMessage,
                showAuthModal: true,
                activeTab: 'register',
            });
        }
    }

    logout(req, res) {
        console.log('🔴 Logout called, current user:', req.session.user);
        req.session.user = null;
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
            }
            res.clearCookie('connect.sid', { path: '/' });
            console.log('✅ Logout successful');
            return res.redirect('/');
        });
    }
}

module.exports = new AuthController();
