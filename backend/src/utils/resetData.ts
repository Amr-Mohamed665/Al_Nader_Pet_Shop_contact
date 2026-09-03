import fs from 'fs';
import path from 'path';

const menuSeed = path.join(__dirname, '..', 'data', 'menuItems.seed.json');
const menuFile = path.join(__dirname, '..', 'data', 'menuItems.json');
const usersFile = path.join(__dirname, '..', 'data', 'users.json');
const ordersFile = path.join(__dirname, '..', 'data', 'orders.json');

fs.writeFileSync(menuFile, fs.readFileSync(menuSeed, 'utf-8'), 'utf-8');
fs.writeFileSync(usersFile, '[]', 'utf-8');
fs.writeFileSync(ordersFile, '[]', 'utf-8');

console.log('✅ menuItems.json reset to seed data.');
console.log('✅ users.json and orders.json cleared — restart the server to recreate the default admin.');
