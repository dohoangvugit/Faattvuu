require('dotenv').config();
const supabase = require('../config/supabase');

// Hàm delay để tránh rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm random
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Dữ liệu mock
const mockUserData = [
    { username: 'mockUser1', email: 'mockuser1@example.com', phone: '0912345001' },
    { username: 'mockUser2', email: 'mockuser2@example.com', phone: '0912345002' },
    { username: 'mockUser3', email: 'mockuser3@example.com', phone: '0912345003' },
    { username: 'mockUser4', email: 'mockuser4@example.com', phone: '0912345004' },
    { username: 'mockUser5', email: 'mockuser5@example.com', phone: '0912345005' },
    { username: 'mockUser6', email: 'mockuser6@example.com', phone: '0912345006' },
    { username: 'mockUser7', email: 'mockuser7@example.com', phone: '0912345007' },
    { username: 'mockUser8', email: 'mockuser8@example.com', phone: '0912345008' },
    { username: 'mockUser9', email: 'mockuser9@example.com', phone: '0912345009' },
    { username: 'mockUser10', email: 'mockuser10@example.com', phone: '0912345010' },
];

const password = '12345678';

async function createMockUsers() {
    console.log('🔄 Bắt đầu tạo dữ liệu mock...\n');

    try {
        // Lấy danh sách sản phẩm
        console.log('📦 Đang lấy danh sách sản phẩm...');
        const { data: allProducts, error: productError } = await supabase
            .from('products')
            .select('id, price');
        
        if (productError) {
            throw new Error(`Lỗi lấy sản phẩm: ${productError.message}`);
        }

        if (!allProducts || allProducts.length === 0) {
            throw new Error('Không có sản phẩm trong hệ thống. Vui lòng thêm sản phẩm trước.');
        }

        console.log(`✅ Tìm thấy ${allProducts.length} sản phẩm\n`);

        // Tạo từng user
        for (let i = 0; i < mockUserData.length; i++) {
            const userData = mockUserData[i];
            console.log(`\n👤 Tạo user ${i + 1}/10: ${userData.username}`);

            // Kiểm tra user đã tồn tại
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', userData.username)
                .single();

            let userId;
            
            if (existingUser) {
                console.log(`   ⚠️  User đã tồn tại, sử dụng user hiện tại`);
                userId = existingUser.id;
            } else {
                // Tạo user mới
                const { data: newUser, error: userError } = await supabase
                    .from('users')
                    .insert([
                        {
                            username: userData.username,
                            email: userData.email,
                            phone: userData.phone,
                            password: password,
                            role: 'client'
                        }
                    ])
                    .select()
                    .single();

                if (userError) {
                    throw new Error(`Lỗi tạo user ${userData.username}: ${userError.message}`);
                }

                userId = newUser.id;
                console.log(`   ✅ User tạo thành công, ID: ${userId}`);
            }

            // Tạo 2-3 đơn hàng cho mỗi user
            const orderCount = getRandomNumber(2, 3);
            console.log(`   📋 Tạo ${orderCount} đơn hàng...`);

            for (let j = 0; j < orderCount; j++) {
                // Chọn 2-3 sản phẩm random
                const itemCount = getRandomNumber(2, 3);
                let totalAmount = 0;
                const orderItems = [];

                // Chọn sản phẩm random
                for (let k = 0; k < itemCount; k++) {
                    const randomProduct = allProducts[getRandomNumber(0, allProducts.length - 1)];
                    const quantity = getRandomNumber(1, 3);
                    const itemTotal = randomProduct.price * quantity;
                    totalAmount += itemTotal;

                    orderItems.push({
                        product_id: randomProduct.id,
                        quantity: quantity,
                        price: randomProduct.price
                    });
                }

                // Tạo đơn hàng
                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert([
                        {
                            user_id: userId,
                            total_amount: totalAmount,
                            status: 'pending'
                        }
                    ])
                    .select()
                    .single();

                if (orderError) {
                    throw new Error(`Lỗi tạo order: ${orderError.message}`);
                }

                console.log(`      📦 Tạo đơn hàng #${j + 1}:`, {
                    id: order.id,
                    total: totalAmount,
                    items: itemCount
                });

                // Thêm các item vào đơn hàng
                for (const item of orderItems) {
                    const { error: itemError } = await supabase
                        .from('order_items')
                        .insert([
                            {
                                order_id: order.id,
                                product_id: item.product_id,
                                quantity: item.quantity,
                                price: item.price
                            }
                        ]);

                    if (itemError) {
                        throw new Error(`Lỗi thêm item vào order: ${itemError.message}`);
                    }
                }

                await delay(200);
            }

            await delay(300);
        }

        console.log('\n\n✅ ✅ ✅ Tạo dữ liệu mock hoàn tất! ✅ ✅ ✅');
        console.log('\n📊 Tóm tắt:');
        console.log(`   • Tạo ${mockUserData.length} users mock`);
        console.log(`   • Mỗi user có 2-3 đơn hàng`);
        console.log(`   • Mỗi đơn hàng có 2-3 sản phẩm`);
        console.log('\n🔑 Thông tin đăng nhập:');
        console.log(`   • Username: mockUser1 - mockUser10`);
        console.log(`   • Password: ${password}`);

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

// Chạy hàm
createMockUsers();
