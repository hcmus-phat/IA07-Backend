import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleLogin = async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).send({ message: "No username or password" });
	}

	// Read users dynamically to get latest data
	const usersData = await fsPromises.readFile(
		path.join(__dirname, "..", "models", "users.json"),
		"utf-8"
	);
	const users = JSON.parse(usersData);

	const foundUser = users.find((u) => u.username === username);
	if (!foundUser) {
		return res.status(401).send({ message: "User not found" });
	}

	const match = await bcrypt.compare(password, foundUser.password);
	if (!match) {
		return res.status(401).send({ message: "Wrong username or password" });
	}

	const accessToken = jwt.sign(
		{ username },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "30s" }
	);

	const refreshToken = jwt.sign(
		{ username },
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "1d" }
	);

	foundUser.refreshToken = refreshToken;
	const otherUsers = users.filter((u) => u != foundUser);
	await fsPromises.writeFile(
		path.join(__dirname, "..", "models", "users.json"),
		JSON.stringify([...otherUsers, foundUser])
	);

	res.cookie("jwt", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "None",
		maxAge: 24 * 60 * 60 * 1000,
	});

	res.json({ accessToken });
};

export { handleLogin };
