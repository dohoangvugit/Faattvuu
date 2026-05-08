const authModel = require('../models/authModel');
const ProductModel = require('../models/productsModel');
const CategoryModel = require('../models/categoryModel');

class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await authModel.login(username, password);

            if (result.rows.length === 0) {
                // Render home với error message
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
            console.error(err);
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
                loginError: 'Có lỗi xảy ra, vui lòng thử lại',
                showAuthModal: true,
                activeTab: 'login',
            });
        }
    }
    async register(req, res) {
        try {
            const { username, email, phone, password, role } = req.body;

            const values = [username, email, phone, password, role || 'client'];

            await authModel.register(values);
            console.log(' Đăng ký thành công:', {
                username,
                email,
                phone,
                role: role || 'client',
            });

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
                registerSuccess: 'Đăng ký thành công! Vui lòng đăng nhập',
                showAuthModal: true,
                activeTab: 'login',
            });
        } catch (error) {
            console.error(' Lỗi đăng ký:', error);

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

            let errorMessage = 'Có lỗi xảy ra, vui lòng thử lại';
            if (error.message.includes('duplicate')) {
                errorMessage = 'Tên người dùng hoặc email đã tồn tại';
            }

            return res.render('home', {
                slides,
                trendingProducts: trending.rows,
                categoriesTop: categories.slice(0, 3),
                categoriesBottom: categories.slice(3, 5),
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
                console.error('Lỗi khi logout:', err);
            }
            res.clearCookie('connect.sid', { path: '/' });
            console.log('✅ Logout successful');
            return res.redirect('/');
        });
    }
}

module.exports = new AuthController();
