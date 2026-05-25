# TEST CASES - GIỎ HÀNG (Shopping Cart)

## 1. TEST CASES - HIỂN THỊ GIỎ HÀNG (Display Cart)

### TC01: Hiển thị giỏ hàng trống
**Precondition:** User đã đăng nhập, giỏ hàng rỗng
- **Action:** Truy cập trang `/cart`
- **Expected Result:** 
  - Hiển thị message "Giỏ hàng trống"
  - Không hiển thị bảng sản phẩm

### TC02: Hiển thị giỏ hàng có sản phẩm
**Precondition:** User đã đăng nhập, giỏ hàng có 1+ sản phẩm
- **Action:** Truy cập trang `/cart`
- **Expected Result:**
  - Hiển thị bảng với các cột: Ảnh, Sản phẩm, Giá, Số lượng, Tổng, (nút X)
  - Hiển thị tất cả sản phẩm trong giỏ
  - Hiển thị nút "Thanh toán →"

### TC03: Hiển thị chi tiết sản phẩm trong giỏ hàng
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** Truy cập `/cart`
- **Expected Result:**
  - Ảnh sản phẩm hiển thị đúng
  - Tên sản phẩm hiển thị đúng
  - Giá sản phẩm hiển thị đúng (VNĐ)
  - Số lượng hiển thị đúng

### TC04: Truy cập giỏ hàng không đăng nhập
**Precondition:** User chưa đăng nhập
- **Action:** Truy cập `/cart`
- **Expected Result:** Redirect đến trang đăng nhập

---

## 2. TEST CASES - THÊM SẢN PHẨM VÀO GIỎ (Add to Cart)

### TC05: Thêm 1 sản phẩm mới vào giỏ hàng
**Precondition:** User đã đăng nhập, giỏ hàng rỗng
- **Action:** API POST `/cart/add` với `{productId: 1, quantity: 1}`
- **Expected Result:**
  - Status: 200, response: `{success: true}`
  - Sản phẩm xuất hiện trong giỏ

### TC06: Thêm sản phẩm đã tồn tại (cộng dồn số lượng)
**Precondition:** Giỏ hàng đã có productId=1 với quantity=2
- **Action:** API POST `/cart/add` với `{productId: 1, quantity: 3}`
- **Expected Result:**
  - Số lượng sản phẩm = 2 + 3 = 5 (không thêm row mới)
  - Status: 200

### TC07: Thêm nhiều sản phẩm khác nhau
**Precondition:** User đã đăng nhập
- **Action:** 
  - Thêm productId=1, quantity=2
  - Thêm productId=2, quantity=1
  - Thêm productId=3, quantity=3
- **Expected Result:**
  - Giỏ hàng có 3 dòng khác nhau
  - Mỗi sản phẩm hiển thị số lượng đúng

### TC08: Thêm số lượng 0
**Precondition:** User đã đăng nhập
- **Action:** API POST `/cart/add` với `{productId: 1, quantity: 0}`
- **Expected Result:** 
  - Xử lý bình thường hoặc báo lỗi validation

### TC09: Thêm số lượng âm
**Precondition:** User đã đăng nhập
- **Action:** API POST `/cart/add` với `{productId: 1, quantity: -5}`
- **Expected Result:**
  - Báo lỗi hoặc reject

### TC10: Thêm productId không tồn tại
**Precondition:** User đã đăng nhập
- **Action:** API POST `/cart/add` với `{productId: 99999, quantity: 1}`
- **Expected Result:**
  - Báo lỗi hoặc xử lý gracefully

### TC11: Thêm sản phẩm không đăng nhập
**Precondition:** User chưa đăng nhập
- **Action:** API POST `/cart/add`
- **Expected Result:** 
  - Status: 401/403 (Unauthorized)

---

## 3. TEST CASES - CẬP NHẬT SỐ LƯỢNG (Update Quantity)

### TC12: Tăng số lượng sản phẩm (Increment)
**Precondition:** Giỏ hàng có sản phẩm với quantity=2
- **Action:** Click nút "+" để tăng quantity
- **Expected Result:**
  - Số lượng = 3
  - Subtotal cập nhật: giá × 3
  - Total cập nhật
  - API PUT `/cart/update` gửi đi thành công

### TC13: Giảm số lượng sản phẩm (Decrement)
**Precondition:** Giỏ hàng có sản phẩm với quantity=5
- **Action:** Click nút "-" để giảm quantity
- **Expected Result:**
  - Số lượng = 4
  - Subtotal cập nhật: giá × 4
  - Total cập nhật
  - API PUT `/cart/update` gửi đi thành công

### TC14: Giảm số lượng xuống 1 (minimum)
**Precondition:** Giỏ hàng có sản phẩm với quantity=1
- **Action:** Click nút "-"
- **Expected Result:**
  - Số lượng vẫn = 1 (không giảm)
  - API không được gọi

### TC15: Cập nhật quantity qua API
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** API PUT `/cart/update` với `{productId: 1, quantity: 10}`
- **Expected Result:**
  - Số lượng = 10
  - Status: 200

### TC16: Cập nhật quantity lớn
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** API PUT `/cart/update` với `{productId: 1, quantity: 1000}`
- **Expected Result:**
  - Số lượng = 1000
  - Không có lỗi (nếu không có validation)

### TC17: Cập nhật quantity = 0
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** API PUT `/cart/update` với `{productId: 1, quantity: 0}`
- **Expected Result:**
  - Xử lý: có thể xóa item hoặc reject

### TC18: Cập nhật productId không tồn tại
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** API PUT `/cart/update` với `{productId: 99999, quantity: 5}`
- **Expected Result:**
  - Báo lỗi

---

## 4. TEST CASES - XÓA SẢN PHẨM (Remove Item)

### TC19: Xóa sản phẩm khỏi giỏ hàng
**Precondition:** Giỏ hàng có 3 sản phẩm
- **Action:** Click nút "X" trên 1 sản phẩm, confirm xóa
- **Expected Result:**
  - Sản phẩm biến mất khỏi bảng
  - Số lượng item giảm 1
  - Total cập nhật
  - API DELETE `/cart/remove` gửi đi

### TC20: Hủy xóa sản phẩm (Cancel)
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** Click "X", nhấn "Cancel" khi confirm
- **Expected Result:**
  - Sản phẩm vẫn trong giỏ
  - API không gửi

### TC21: Xóa tất cả sản phẩm
**Precondition:** Giỏ hàng có 2 sản phẩm
- **Action:** 
  - Xóa sản phẩm 1
  - Xóa sản phẩm 2
- **Expected Result:**
  - Giỏ hàng rỗng
  - Hiển thị "Giỏ hàng trống"

### TC22: Xóa sản phẩm không tồn tại
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** API DELETE `/cart/remove` với `{productId: 99999}`
- **Expected Result:**
  - Báo lỗi hoặc xử lý gracefully

### TC23: Xóa sản phẩm không đăng nhập
**Precondition:** User chưa đăng nhập
- **Action:** API DELETE `/cart/remove`
- **Expected Result:**
  - Status: 401/403

---

## 5. TEST CASES - TÍNH TOÁN TIỀN (Calculation)

### TC24: Tính Subtotal đúng
**Precondition:** Sản phẩm giá 100,000 VNĐ, quantity=3
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Subtotal = 100,000 × 3 = 300,000 VNĐ

### TC25: Tính Total nhiều sản phẩm
**Precondition:** 
- Sản phẩm 1: 100,000 × 2 = 200,000
- Sản phẩm 2: 50,000 × 1 = 50,000
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Total = 200,000 + 50,000 = 250,000 VNĐ

### TC26: Cập nhật Total khi thay đổi quantity
**Precondition:** 
- Sản phẩm 1: 100,000 × 2 = 200,000
- Total hiện tại: 200,000
- **Action:** Tăng quantity sản phẩm 1 lên 5
- **Expected Result:**
  - Subtotal = 100,000 × 5 = 500,000
  - Total = 500,000

### TC27: Cập nhật Total khi xóa sản phẩm
**Precondition:** 
- Sản phẩm 1: 100,000 × 2 = 200,000
- Sản phẩm 2: 50,000 × 3 = 150,000
- Total: 350,000
- **Action:** Xóa sản phẩm 1
- **Expected Result:**
  - Total = 150,000

### TC28: Hiển thị Total bằng 0 khi giỏ rỗng
**Precondition:** Xóa hết sản phẩm
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Total = 0 VNĐ

---

## 6. TEST CASES - API & BACKEND

### TC29: GET /cart/api - Lấy giỏ hàng (JSON)
**Precondition:** User đã đăng nhập, giỏ hàng có sản phẩm
- **Action:** API GET `/cart/api`
- **Expected Result:**
  - Status: 200
  - Response: `{success: true, cartId: X, items: [...]}`
  - Items chứa: id, quantity, products(id, name, price, image)

### TC30: Tạo giỏ hàng tự động khi không tồn tại
**Precondition:** User mới chưa có giỏ hàng
- **Action:** API GET `/cart/api`
- **Expected Result:**
  - Giỏ hàng được tạo tự động
  - Response trả về cartId mới

### TC31: Sử dụng đúng user_id
**Precondition:** User A và User B
- **Action:** 
  - User A thêm sản phẩm vào giỏ
  - User B thêm sản phẩm vào giỏ
  - Kiểm tra giỏ từng user
- **Expected Result:**
  - User A thấy sản phẩm của User A
  - User B thấy sản phẩm của User B
  - Không bị trộn dữ liệu

### TC32: Error handling - Server error
**Precondition:** Database down hoặc lỗi backend
- **Action:** Thực hiện bất kỳ thao tác cart nào
- **Expected Result:**
  - Status: 500
  - Response: `{error: "message"}`

---

## 7. TEST CASES - LIÊN KẾT VỚI CHECKOUT

### TC33: Nút "Thanh toán →" hiển thị khi giỏ không rỗng
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Nút "Thanh toán →" hiển thị
  - Link đến `/checkout`

### TC34: Nút "Thanh toán →" ẩn khi giỏ rỗng
**Precondition:** Giỏ hàng rỗng
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Nút "Thanh toán →" không hiển thị

### TC35: Click nút "Thanh toán →"
**Precondition:** Giỏ hàng có sản phẩm
- **Action:** Click nút "Thanh toán →"
- **Expected Result:**
  - Redirect đến trang `/checkout`
  - Thông tin giỏ hàng vẫn còn

---

## 8. TEST CASES - LỊCH SỬ ĐƠN HÀNG (Order History)

### TC36: Hiển thị lịch sử đơn hàng
**Precondition:** User có 2+ đơn hàng trước đó
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Bảng "Lịch sử đơn hàng" hiển thị
  - Hiển thị: Mã đơn, Ngày tạo, Trạng thái, Tổng tiền, Chi tiết

### TC37: Không hiển thị lịch sử khi không có đơn
**Precondition:** User mới không có đơn hàng nào
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Phần lịch sử đơn không hiển thị hoặc hiển thị "Không có đơn hàng"

### TC38: Thông tin đơn hàng chính xác
**Precondition:** User có 1 đơn hàng
- **Action:** Mở giỏ hàng, kiểm tra đơn
- **Expected Result:**
  - Mã đơn đúng
  - Ngày tạo đúng
  - Trạng thái đúng
  - Tổng tiền = tổng các item × giá

---

## 9. TEST CASES - SECURITY

### TC39: CSRF Protection (credentials: include)
**Precondition:** Frontend gửi request
- **Action:** Kiểm tra request có `credentials: 'include'`
- **Expected Result:**
  - Cookie được gửi kèm

### TC40: Authorization - requireLogin middleware
**Precondition:** User chưa đăng nhập
- **Action:** 
  - POST `/cart/add`
  - PUT `/cart/update`
  - DELETE `/cart/remove`
  - GET `/cart/api`
- **Expected Result:**
  - Tất cả reject (401/403)

### TC41: Authorization - renderCartPage (requireLoginPage)
**Precondition:** User chưa đăng nhập
- **Action:** GET `/cart`
- **Expected Result:**
  - Redirect đến trang đăng nhập

---

## 10. TEST CASES - EDGE CASES

### TC42: Số lượng rất lớn
**Precondition:** Cart có sản phẩm
- **Action:** Tăng quantity lên 999,999
- **Expected Result:**
  - Hiển thị đúng
  - Total tính toán đúng
  - Không crash frontend

### TC43: Giá sản phẩm thập phân
**Precondition:** Sản phẩm có giá 99.99 VNĐ
- **Action:** Mở giỏ hàng, tính toán
- **Expected Result:**
  - Tính toán đúng (làm tròn nếu cần)

### TC44: Product name dài
**Precondition:** Sản phẩm có tên rất dài
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Hiển thị không bị lỗi
  - Layout không bị vỡ

### TC45: Ảnh sản phẩm không tồn tại
**Precondition:** Sản phẩm có link ảnh invalid
- **Action:** Mở giỏ hàng
- **Expected Result:**
  - Hiển thị broken image hoặc placeholder
  - Không crash page

### TC46: Cập nhật giỏ từ nhiều tab cùng lúc
**Precondition:** Mở 2 tab giỏ hàng cùng user
- **Action:** 
  - Tab 1: Tăng quantity sản phẩm X lên 5
  - Tab 2: Tăng quantity sản phẩm X lên 10
- **Expected Result:**
  - Backend cập nhật đúng (tùy thứ tự)

---

## 11. PERFORMANCE TEST

### TC47: Load giỏ hàng với 100 sản phẩm
**Action:** Giỏ hàng có 100 item, mở trang
- **Expected Result:**
  - Trang load < 3 giây
  - Không lag

### TC48: Tính toán Total với 100 sản phẩm
**Action:** 100 item, mỗi lần thay đổi quantity
- **Expected Result:**
  - Total tính toán ngay lập tức
  - UI responsive

---

## 12. TEST COVERAGE SUMMARY

| Feature | Test Cases | Priority |
|---------|-----------|----------|
| Display Cart | TC01-TC04 | High |
| Add to Cart | TC05-TC11 | High |
| Update Quantity | TC12-TC18 | High |
| Remove Item | TC19-TC23 | High |
| Calculation | TC24-TC28 | High |
| API Backend | TC29-TC32 | High |
| Checkout Link | TC33-TC35 | Medium |
| Order History | TC36-TC38 | Medium |
| Security | TC39-TC41 | Critical |
| Edge Cases | TC42-TC46 | Medium |
| Performance | TC47-TC48 | Low |

---

**Ghi chú:**
- Tất cả test cases phải có precondition rõ ràng
- Expected result phải có thể kiểm chứng được
- Priority: Critical > High > Medium > Low
- Các test cases nên chạy theo thứ tự: Setup → Execute → Teardown
