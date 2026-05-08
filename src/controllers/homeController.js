const ProductModel = require('../models/productsModel');
const CategoryModel = require('../models/categoryModel');

class HomeController {
    async index(req, res) {
        try {
            const result = await ProductModel.getAll();

            const slides = result.rows.map((product) => ({
                id: product.id,
                image: product.image,
                name: product.name,
                description: product.description,
                price: product.price,
            }));

            const trending = await ProductModel.getTrendingSofas(12);
            const categoriesResult = await CategoryModel.getOverview();
            const categories = categoriesResult.rows;

            // Handle auth query parameters
            const { auth } = req.query;
            const renderData = {
                slides,
                trendingProducts: trending.rows,
                categoriesTop: categories.slice(0, 3),
                categoriesBottom: categories.slice(3, 5),
                activeTab: auth === 'register' ? 'register' : 'login',
            };

            if (auth) {
                renderData.showAuthModal = true;
            }

            res.render('home', renderData);
        } catch (error) {
            console.error('❌ Error in home controller:', error.message);
            res.render('home', {
                slides: [],
                trendingProducts: [],
                categoriesTop: [],
                categoriesBottom: [],
                activeTab: 'login',
            });
        }
    }

    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || q.trim() === '') {
                return res.redirect('/');
            }

            const result = await ProductModel.search(q);
            res.render('search', {
                keyword: q,
                products: result.rows,
                activeTab: 'login',
            });
        } catch (error) {
            console.error('❌ Error in search:', error.message);
            res.render('search', {
                keyword: '',
                products: [],
                activeTab: 'login',
            });
        }
    }
}

module.exports = new HomeController();
