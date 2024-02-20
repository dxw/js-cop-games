export const getElementById = <T extends HTMLElement>(id: T["id"]): T => {
	const element = document.getElementById(id) as T;

	if (!element) {
		throw new Error(`No element found with ID: ${id}`);
	}

	return element;
};
