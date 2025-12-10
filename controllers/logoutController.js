import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleLogout = async (req, res) => {
	const token = req.cookies?.jwt;
	if (!token) {
		return res.sendStatus(204);
	}

	// Read users dynamically to get latest data
	const usersData = await fsPromises.readFile(
		path.join(__dirname, "..", "models", "users.json"),
		"utf-8"
	);
	const users = JSON.parse(usersData);

	const foundUser = users.find((u) => u.refreshToken === token);
	if (!foundUser) {
		res.clearCookie("jwt", {
			httpOnly: true,
			secure: true,
			sameSite: "None",
		});

		return res.sendStatus(204);
	}

	foundUser.refreshToken = "";
	const otherUsers = users.filter((u) => u.username !== foundUser.username);

	await fsPromises.writeFile(
		path.join(__dirname, "..", "models", "users.json"),
		JSON.stringify([...otherUsers, foundUser])
	);

	res.clearCookie("jwt", {
		httpOnly: true,
		secure: true,
		sameSite: "None",
	});

	res.sendStatus(204);
};

export { handleLogout };
