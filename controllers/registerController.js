import bcrypt from "bcrypt";
import fsPromises from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handleRegister = async (req, res) => {
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

	const exist = users.find((u) => u.username === username);
	if (exist) {
		return res.status(409).send({ message: "User existed" });
	}

	try {
		const hashed = await bcrypt.hash(password, 10);
		const currentUser = {
			username,
			password: hashed,
		};

		const newUsers = [...users, currentUser];
		await fsPromises.writeFile(
			path.join(__dirname, "..", "models", "users.json"),
			JSON.stringify(newUsers)
		);
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}

	res.status(200).send({ message: `User ${username} created` });
};

export { handleRegister };
