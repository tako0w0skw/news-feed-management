const express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express()
const port = 3000
const {
	getAllUsers,
	createUser,
	updateUser,
	getEditUser,
	deleteUser,
	resetPassword,
  } = require("./controller/userController");

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(session({
	resave: false, //không lưu nếu chưa sửa đổi
	saveUninitialized: false, //không tạo đơn vị phiên bản lưu trữ thứ gì đó
	secret: 'keybord cat', //khóa bí mật để mã hóa phiên
}));

app.get('/', (req, res) => {
	res.render('login.ejs')
})

app.post('/', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})

	con.connect(function (err) {
		if (err) throw err;
		console.log("Kết nối thành công");
		var sql = "SELECT * FROM users WHERE STATUS = 1 AND username = '" + req.body.username + "' AND user_password = '" + req.body.user_password + "'";
		con.query(sql, function (err, result) {
			if (err) throw err;
			if (result.length == 0) {
				console.log("Tài khoản hoặc mật khẩu không đúng!");
				res.render('login.ejs', { errorMessage: 'Tài khoản hoặc mật khẩu không đúng!' });
			}
			else {
				console.log("Đăng nhập thành công!");
				res.render('layout', { content: 'index.ejs' });
			}
		});
	});
});

app.get('/index', (req, res) => {
	res.render('layout', { content: 'index.ejs' })
});

app.get('/404', (req, res) => {
	res.status(404).render('layout', { content: '404.ejs' })
});

app.get('/logout', (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log('Error while destroying session:', err);
			res.render('layout', { content: 'index.ejs' })
		}
		res.render('login.ejs')
	});
});

app.get('/categories', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	con.query("SELECT * FROM categories WHERE status = 1", function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}
		res.render('layout', { content: 'categories/categories.ejs', categories: result });
	});
});

app.get('/categories/add', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "SELECT * FROM categories WHERE status = 1 ORDER BY category_id DESC LIMIT 1";
	con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}
		console.log(result);
		res.render('layout', { content: 'categories/add_category.ejs', categories: result[0] });
	});
});

app.post('/categories/add', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "INSERT INTO categories (category_name, status) VALUES (?,?)";
	con.query(sql, [req.body.category_name, req.body.status], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi thêm danh mục");
		}
		console.log(result);
		res.redirect('/categories');
	});
});

app.get('/categories/edit/:id', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "SELECT * FROM categories WHERE category_id = ?";
	// const sql = "UPDATE categories SET name = ? WHERE id = ?";
	con.query(sql, [req.params.id], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}
		console.log(result);
		res.render('layout', { content: 'categories/edit_category.ejs', categories: result[0] });
	});
});

app.post('/categories/edit/:id', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "UPDATE `categories` SET `category_name` = ?, `status` = ? WHERE `category_id` = ?";
	con.query(sql, [req.body.category_name, req.body.status, req.params.id], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi cập nhật danh mục");
		}
		console.log(result);
		console.log(req.body.category_name);
		console.log(req.body.status);
		console.log(req.params.id);
		res.redirect('/categories');
	});
});

app.post('/categories/delete/:id', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "UPDATE categories SET status = 0 WHERE category_id = ?";
	con.query(sql, [req.params.id], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi xóa danh mục");
		}
		console.log(result);
		res.redirect('/categories');
	});
});

app.get('/contacts', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "SELECT * FROM contacts"
	con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}
		res.render('layout', { content: 'contact.ejs', contacts: result });
	});
});

app.get('/posts', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = `
	SELECT posts.*, users.full_name, categories.category_name
	FROM posts JOIN users ON posts.author_id = users.user_id JOIN categories ON posts.category_id = categories.category_id
	WHERE posts.STATUS = 1
	GROUP BY post_id
	`
	con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}
		res.render('layout', { content: 'posts/posts.ejs', posts: result });
	});
});

app.post('/posts/delete/:id', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "UPDATE posts SET status = 0 WHERE post_id = ?";
	con.query(sql, [req.params.id], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi xóa bài viết");
		}
		res.redirect('/posts');
	});
});

app.get('/posts/edit/:id', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = `
	SELECT *
	FROM posts JOIN users ON posts.author_id = users.user_id JOIN categories ON posts.category_id = categories.category_id
	WHERE posts.post_id = ? AND posts.STATUS = 1
	GROUP BY post_id
	`
	const category_sql = "SELECT * FROM categories WHERE status = 1"
	
	con.query(sql, [req.params.id], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}

		con.query(category_sql, function (err, categories) {
			if (err) {
				console.error(err);
				return res.status(500).send("Lỗi truy vấn CSDL");
			}
			res.render('layout', { content: 'posts/edit_post.ejs', posts:  result[0], categories: categories });
		});
	});
});

app.post('/posts/edit/:id', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "UPDATE posts SET title = ?, post_content = ?, image_url = ?, category_id = ?, STATUS = ? WHERE post_id = ?";
	con.query(sql, [req.body.title, req.body.post_content, req.body.image_url, req.body.category_id, req.body.status, req.params.id], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi cập nhật bài viết");
		}
		res.redirect('/posts');
	});
});

app.get('/posts/add', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "SELECT * FROM categories WHERE status = 1"
	const sql2 = "SELECT * FROM posts WHERE status = 1 ORDER BY post_id DESC LIMIT 1"
	con.query(sql, function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi truy vấn CSDL");
		}

		con.query(sql2, function (err, posts) {
			if (err) {
				console.error(err);
				return res.status(500).send("Lỗi truy vấn CSDL");
			}
			res.render('layout', { content: 'posts/add_post.ejs', posts: posts[0], categories: result });
		});
	});
});

app.post('/posts/add', (req, res) => {
	var mysql2 = require('mysql2')
	var con = mysql2.createConnection({
		host: "localhost",
		user: "root",
		password: "",
		database: "newsfeed_management"
	})
	const sql = "INSERT INTO posts (title, post_content, image_url, category_id, STATUS) VALUES (?,?,?,?,?)";
	con.query(sql, [req.body.title, req.body.post_content, req.body.image_url, req.body.category_id, req.body.status], function (err, result) {
		if (err) {
			console.error(err);
			return res.status(500).send("Lỗi thêm bài viết");
		}
		console.log(result);
		res.redirect('/posts');
	});
});

app.get("/users", getAllUsers);
app.get("/users/add", (req, res) => {
  res.render("layout", { content: "users/add.ejs", data: {} });
});
app.get("/users/edit/:id", getEditUser);

app.post("/users/add", createUser);
app.post("/users/edit/:id", updateUser);

app.post("/users/delete/:id", deleteUser);
app.post("/users/reset/:id", resetPassword);

app.listen(port, () => console.log(`Server running at http://127.0.0.1:${port}`))