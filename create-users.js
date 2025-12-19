// create-users.js - Chạy một lần để tạo users.json đã băm mật khẩu

const bcrypt = require('bcrypt');
const fs = require('fs');
const xlsx = require('xlsx');  // Để đọc file Excel

// Cấu hình
const EXCEL_FILE = 'nhanvien.xlsx';  // Đổi thành tên file của bạn (hoặc .csv)
const SHEET_NAME = 'Sheet1';         // Tên sheet trong Excel (thường là Sheet1)
const OUTPUT_FILE = 'users.json';

console.log('Đang đọc file Excel...');

let employees = [];

// Đọc file Excel
if (EXCEL_FILE.endsWith('.xlsx') || EXCEL_FILE.endsWith('.xls')) {
  const workbook = xlsx.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets[SHEET_NAME || workbook.SheetNames[0]];
  employees = xlsx.utils.sheet_to_json(sheet);
} else if (EXCEL_FILE.endsWith('.csv')) {
  const csvData = fs.readFileSync(EXCEL_FILE, 'utf8');
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  employees = lines.slice(1).map(line => {
    const values = line.split(',');
    let obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim());
    return obj;
  });
} else {
  console.error('Chỉ hỗ trợ file .xlsx hoặc .csv');
  process.exit(1);
}

if (employees.length === 0) {
  console.error('Không tìm thấy dữ liệu nhân viên nào!');
  process.exit(1);
}

console.log(`Tìm thấy ${employees.length} nhân viên. Đang băm mật khẩu...`);

// Băm mật khẩu và tạo danh sách users
const users = employees.map(emp => {
  if (!emp.id || !emp.name || !emp.password) {
    console.warn(`Dòng thiếu dữ liệu: ${JSON.stringify(emp)} → bỏ qua`);
    return null;
  }
  return {
    id: emp.id.trim(),
    name: emp.name.trim(),
    hash: bcrypt.hashSync(emp.password.trim(), 10)  // 10 là độ mạnh băm (cân bằng tốc độ & bảo mật)
  };
}).filter(u => u !== null);

console.log(`Đã băm xong ${users.length} tài khoản.`);

// Ghi ra file users.json
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(users, null, 2), 'utf8');

console.log(`\nHOÀN TẤT! File ${OUTPUT_FILE} đã được tạo thành công.`);
console.log(`   → Có ${users.length} tài khoản sẵn sàng sử dụng.`);
console.log(`   → Mật khẩu gốc đã được băm an toàn (không thể khôi phục).`);
console.log(`\nLưu ý quan trọng:`);
console.log(`   - Xóa ngay file Excel/CSV chứa mật khẩu gốc sau khi xong.`);
console.log(`   - Không bao giờ commit file Excel gốc lên Git!`);
console.log(`   - Khởi động lại server để load users.json mới.\n`);
