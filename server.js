const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // phục vụ file tĩnh: index.html, v.v.

let users = [];

// Tải danh sách users từ file
function loadUsers() {
  try {
    if (fs.existsSync('users.json')) {
      users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
    } else {
      console.log('Chưa có file users.json – sẽ tạo mẫu khi đăng nhập thất bại');
      users = [];
    }
  } catch (err) {
    console.error('Lỗi đọc users.json:', err);
    users = [];
  }
}

loadUsers();

// API đăng nhập
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ success: false, message: 'Vui lòng nhập đầy đủ' });
  }

  const user = users.find(u => u.id === username.trim());

  if (!user) {
    return res.json({ success: false, message: 'Mã nhân viên không tồn tại' });
  }

  if (bcrypt.compareSync(password, user.hash)) {
    res.json({
      success: true,
      user: { id: user.id, name: user.name }
    });
  } else {
    res.json({ success: false, message: 'Mật khẩu sai' });
  }
});

// Lưu users lại khi cần (tương lai có thể thêm API đổi mật khẩu)
function saveUsers() {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
  console.log(`Truy cập trang tra cứu lương: http://localhost:${PORT}`);
});
