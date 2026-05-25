require('dotenv').config()
const ProductModel = require('../../models/productsModel');
const CategoryModel = require('../../models/categoryModel');
const { createClient } = require('@supabase/supabase-js');


// Hàm helper hỗ trợ upload file buffer lên Supabase và lấy Public URL
async function uploadToSupabase(file) {
    // Tạo tên file ngẫu nhiên để tránh trùng lặp
    const ext = file.originalname.split('.').pop();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = `products/${filename}`;

    // Upload buffer từ RAM lên bucket 'anh'
    const { data, error } = await supabase.storage
        .from('anh')
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) throw error;

    // Lấy URL công khai
    const { data: publicUrlData } = supabase.storage
        .from('anh')
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
}

// Hàm helper hỗ trợ xóa ảnh cũ trên Supabase Storage nếu cần dọn dẹp không gian lưu trữ
async function deleteFromSupabase(publicUrl) {
    try {
        if (!publicUrl || !publicUrl.includes('supabase.co/storage/v1/object/public/anh/')) return;
        
        // Trích xuất lại đường dẫn tương đối (relative path) từ URL tuyệt đối
        const filePath = publicUrl.split('/public/anh/')[1];
        if (filePath) {
            await supabase.storage.from('anh').remove([filePath]);
        }
    } catch (err) {
        console.error('Không thể xóa ảnh cũ trên Supabase:', err.message);
    }
}

class AdminProductController {
    // POST /admin/products
    async create(req, res) {
        try {
            const { name, brand, price, description, currentInventory, categoryId } = req.body;

            // Kiểm tra file upload (lúc này Multer Memory lưu ở req.file)
            if (!req.file) {
                return res.status(400).send('Vui lòng chọn ảnh sản phẩm');
            }

            // Thực hiện tải ảnh lên Supabase Storage
            const imageUrl = await uploadToSupabase(req.file);

            const productData = await ProductModel.create({
                name,
                brand,
                price,
                description,
                inventory: currentInventory,
                image: imageUrl, // Lưu trực tiếp chuỗi URL đầy đủ vào DB
            });

            // Lưu danh mục cho sản phẩm nếu có chọn
            if (categoryId && productData.rows && productData.rows[0]) {
                await ProductModel.addCategory(productData.rows[0].id, categoryId);
            }

            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send('Create product failed');
        }
    }

    // DELETE /admin/products/:id
    async delete(req, res) {
        try {
            const { id } = req.params;

            const result = await ProductModel.findById(id);
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false });
            }

            const product = result.rows[0];

            // Xóa file vật lý trên Cloud Supabase
            await deleteFromSupabase(product.image);

            // Xóa thông tin sản phẩm trong DB
            await ProductModel.deleteById(id);

            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false });
        }
    }

    async index(req, res) {
        try {
            const result = await ProductModel.getAll();

            res.render('admin/products', {
                layout: 'admin',
                products: result.rows,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading products');
        }
    }

    async showAddForm(req, res) {
        try {
            const categories = await CategoryModel.getAll();
            res.render('admin/add-product', {
                layout: 'admin',
                categories: categories.rows,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading form');
        }
    }

    // GET /admin/products/:id/edit
    async showEditForm(req, res) {
        try {
            const { id } = req.params;

            const result = await ProductModel.findById(id);
            if (result.rows.length === 0) {
                return res.send('Product not found');
            }

            const categories = await CategoryModel.getAll();
            const productCategories = await ProductModel.getCategoriesForProduct(id);
            
            // Lấy category_id được chọn
            const selectedCategoryId = productCategories.rows?.[0]?.category_id;

            // Thêm thuộc tính selected vào categories
            const categoriesWithSelected = categories.rows.map(cat => ({
                ...cat,
                selected: cat.id === selectedCategoryId,
            }));

            res.render('admin/edit-product', {
                layout: 'admin',
                product: result.rows[0],
                categories: categoriesWithSelected,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error loading edit form');
        }
    }

    // POST /admin/products/:id
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, price, brand, description, currentInventory, categoryId } = req.body;

            const result = await ProductModel.findById(id);
            if (result.rows.length === 0) {
                return res.status(404).send('Sản phẩm không tồn tại');
            }

            const oldProduct = result.rows[0];
            let imagePath = oldProduct.image;

            // Nếu người dùng upload ảnh mới thay thế
            if (req.file) {
                // 1. Dọn dẹp xóa ảnh cũ trên Supabase trước
                await deleteFromSupabase(oldProduct.image);

                // 2. Tải ảnh mới lên
                imagePath = await uploadToSupabase(req.file);
            }

            await ProductModel.update(id, {
                name,
                price,
                brand,
                description,
                inventory: currentInventory,
                image: imagePath,
            });

            // Cập nhật danh mục
            if (categoryId) {
                // Xóa tất cả danh mục cũ
                await ProductModel.removeAllCategories(id);
                // Thêm danh mục mới
                await ProductModel.addCategory(id, categoryId);
            }

            res.redirect('/admin/products');
        } catch (err) {
            console.error(err);
            res.status(500).send('Update product failed');
        }
    }
}

module.exports = new AdminProductController();