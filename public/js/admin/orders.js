function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 9999;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const statusBadges = {
    pending: { badge: 'bg-warning', text: 'Đang xử lý' },
    completed: { badge: 'bg-success', text: 'Hoàn thành' },
    cancelled: { badge: 'bg-danger', text: 'Hủy' }
};

$(document).ready(function () {
    $('#ordersTable').DataTable({
        pageLength: 10,
    });

    $(document).on('change', '.updateStatus', function () {
        const orderId = $(this).data('id');
        const status = $(this).val();
        const $select = $(this);
        const $row = $select.closest('tr');
        const $badgeCell = $row.find('td:eq(3)');

        if (!status) return;

        $select.prop('disabled', true);

        fetch(`/admin/orders/${orderId}/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    const badgeInfo = statusBadges[status];
                    $badgeCell.html(`<span class='badge ${badgeInfo.badge}'>${badgeInfo.text}</span>`);
                    showToast('Cập nhật trạng thái thành công!');
                } else {
                    showToast('Lỗi: ' + (data.error || 'Cập nhật không thành công'), 'error');
                }
            })
            .catch((err) => {
                console.error(err);
                showToast('Có lỗi xảy ra, vui lòng thử lại', 'error');
            })
            .finally(() => {
                $select.prop('disabled', false);
            });
    });
});

if (!document.querySelector('style[data-toast-animation]')) {
    const style = document.createElement('style');
    style.setAttribute('data-toast-animation', 'true');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}