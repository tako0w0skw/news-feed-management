const mysql2 = require("mysql2");

const conn = mysql2.createConnection({
  host: "127.0.0.1",
  user: "root", // Adjust based on your mysql2 setup
  password: "", // Adjust based on your mysql2 setup
  database: "newsfeed_management",
});

function getAllUsers(req, res) {
  var query = "SELECT * FROM users WHERE STATUS = 1";

  conn.query(query, (err, result) => {
    if (err) {
      console.error("Error inserting contact:", err);
      res.status(500).send("Error submitting contact form");
      return;
    }

    let data = {
      users: JSON.parse(JSON.stringify(result)),
    };

    res.render("layout", {
      content: "users/user.ejs",
      data: data,
    });
  });
}
//them user
function createUser(req, res) {
  var query =
    "INSERT INTO users(full_name, username, user_password, email, role, STATUS) VALUES(?, ?, ?, ?, ?, ?)";
  console.log(req.body);
  const { full_name, username, user_password, email, role, status } = req.body;
  conn.query(
    query,
    [full_name, username, user_password, email, role, status],
    (err, result) => {
      if (err) {
        console.error("Error inserting contact:", err);
        res.status(500).send("Error submitting contact form");
        return;
      }

      console.log(result);
      if (result.affectedRows > 0) {
        console.log("User created successfully!");
        return res.redirect("/users");
      }
    }
  );
}

function deleteUser(req, res) {
  const { id } = req.params;
  const query = "UPDATE users SET STATUS = 0 WHERE user_id = ?";

  conn.query(query, [id], (err, result) => {
    if (err) {
      console.error("Lỗi khi xóa mềm user:", err);
      return res.status(500).send("Lỗi khi xóa người dùng");
    }

    return res.redirect("/users");
  });
}
// Lấy thông tin user để sửa
function getEditUser(req, res) {
  const { id } = req.params;
  const query = "SELECT * FROM users WHERE user_id = ?";

  conn.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Lỗi khi lấy thông tin người dùng");
    }

    if (result.length === 0) {
      return res.status(404).send("Không tìm thấy người dùng");
    }

    let data = { user: result[0] };
    res.render("layout", {
      content: "users/edit.ejs",
      data: data,
    });
  });
}

// Cập nhật thông tin user
function updateUser(req, res) {
  const { id } = req.params;
  const { full_name, username, email, role } = req.body;
  console.log(req.body);
  console.log("ID:", id);
  const query =
    "UPDATE users SET full_name = ?, username = ?, email = ?, role = ? WHERE user_id = ?";

  conn.query(query, [full_name, username, email, role, id], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      return res.status(500).send("Lỗi khi cập nhật người dùng");
    }

    return res.redirect("/users");
  });
}

function resetPassword(req, res) {
  const { id } = req.params;
  const query = "UPDATE users SET user_password = '1' WHERE user_id = ?";

  conn.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error resetting password:", err);
      return res.status(500).send("Lỗi khi đặt lại mật khẩu");
    }

    return res.redirect("/users");
  });
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
  getEditUser,
  updateUser,
  resetPassword,
};
