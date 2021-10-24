const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middleWares = jsonServer.defaults();
server.use(jsonServer.bodyParser);
server.use(middleWares);

const getUsersDb = () => {
    return JSON.parse(
        fs.readFileSync(path.join(__dirname, 'users.json'), 'UTF-8')//加入絕對路徑
    );
};

const isAuthenticated = ({ email, password }) => {
    return (
        getUsersDb().users.findIndex(user => user.email === email && user.password === password) !== -1
        //findIndex方法回傳數字 > !== -1 表示有取到值  return true
    );
};

const SECRET = '12321JKLSJKLSDFJK23423432'; //暫時隨意定義
const expiresIn = '1h';
const createToken = payload => {
    return jwt.sign(payload, SECRET, { expiresIn });
};

server.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (isAuthenticated({ email, password })) {
        const user = getUsersDb().users.find(
            u => u.email === email && u.password === password
        );
        const { nickname, type } = user;
        // jwt
        const jwToken = createToken({ nickname, type, email });
        return res.status(200).json(jwToken);
    } else {
        const status = 401;
        const message = 'Incorrect email or password';
        return res.status(status).json({ status, message });
    }
});

server.use(router);
server.listen(3003, () => {
    console.log('JSON Server is running');
});