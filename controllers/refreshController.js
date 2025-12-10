import jwt from "jsonwebtoken";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleRefresh = async (req, res) => {
	const token = req.cookies?.jwt;
	if (!token) {
		return res.sendStatus(401);
	}

	// Read users dynamically to get latest data
	const usersData = await fsPromises.readFile(
		path.join(__dirname, "..", "models", "users.json"),
		"utf-8"
	);
	const users = JSON.parse(usersData);

	const foundUser = users.find((u) => u.refreshToken === token);
	if (!foundUser) {
		return res.sendStatus(401);
	}

	jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			return res.sendStatus(403);
		}

		if (foundUser.username !== decoded.username) {
			return res.sendStatus(403);
		}

		const accessToken = jwt.sign(
			{ username: foundUser.username },
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "30s" }
		);

		return res.json({ accessToken });
	});
};

export default handleRefresh;
