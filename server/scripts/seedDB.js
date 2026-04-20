/**
 * seedDB.js — one-time seeder for Instamart MongoDB Atlas
 *
 * Seeds:
 *   • products  (49 688 rows from products_with_images.csv)
 *   • aisles    (134  rows from aisles.csv)
 *   • departments (21 rows from departments.csv)
 *
 * Run:  node scripts/seedDB.js
 */

// Force Google DNS — local ISP resolver doesn't carry MongoDB SRV records
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ─── Mongoose Models (inline to keep script self-contained) ───────────────────

const productSchema = new mongoose.Schema({
  product_id:      { type: Number, required: true, unique: true },
  product_name:    { type: String, required: true, trim: true },
  aisle_id:        { type: Number, required: true },
  department_id:   { type: Number, required: true },
  image_link:      { type: String, trim: true, default: '' },
  catalog_content: { type: String, trim: true, default: '' },
  price:           { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ aisle_id: 1 });
productSchema.index({ department_id: 1 });
productSchema.index({ product_name: 'text' });

const aisleSchema = new mongoose.Schema({
  aisle_id: { type: Number, required: true, unique: true },
  aisle:    { type: String, required: true, trim: true },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  department_id: { type: Number, required: true, unique: true },
  department:    { type: String, required: true, trim: true },
}, { timestamps: true });

const Product    = mongoose.model('Product',    productSchema);
const Aisle      = mongoose.model('Aisle',      aisleSchema);
const Department = mongoose.model('Department', departmentSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DATASET_DIR = path.join(__dirname, '..', '..', '..', 'Dataset');
const BATCH_SIZE  = 500;
const PLACEHOLDER_IMAGE = 'https://placehold.co/300x300/e8f5e9/2e7d32?text=No+Image';

function log(msg) {
  const ts = new Date().toLocaleTimeString();
  console.log(`[${ts}] ${msg}`);
}

async function streamCSV(filePath, batchSize, processBatch) {
  return new Promise((resolve, reject) => {
    let batch = [];
    let total = 0;

    const parser = parse({ columns: true, trim: true, skip_empty_lines: true });

    parser.on('readable', async function () {
      let record;
      while ((record = this.read()) !== null) {
        batch.push(record);
        if (batch.length >= batchSize) {
          this.pause();
          const current = batch.splice(0, batchSize);
          total += current.length;
          await processBatch(current, total);
          this.resume();
        }
      }
    });

    parser.on('end', async () => {
      if (batch.length > 0) {
        total += batch.length;
        await processBatch(batch, total);
      }
      resolve(total);
    });

    parser.on('error', reject);
    createReadStream(filePath).pipe(parser);
  });
}

// ─── Seeders ──────────────────────────────────────────────────────────────────

async function seedDepartments() {
  log('Seeding departments…');
  const filePath = path.join(DATASET_DIR, 'departments.csv');
  const docs = await new Promise((resolve, reject) => {
    const results = [];
    createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
      .on('data', row => results.push({ department_id: Number(row.department_id), department: row.department }))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
  await Department.deleteMany({});
  await Department.insertMany(docs, { ordered: false });
  log(`✔ Departments seeded: ${docs.length}`);
}

async function seedAisles() {
  log('Seeding aisles…');
  const filePath = path.join(DATASET_DIR, 'aisles.csv');
  const docs = await new Promise((resolve, reject) => {
    const results = [];
    createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }))
      .on('data', row => results.push({ aisle_id: Number(row.aisle_id), aisle: row.aisle }))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
  await Aisle.deleteMany({});
  await Aisle.insertMany(docs, { ordered: false });
  log(`✔ Aisles seeded: ${docs.length}`);
}

async function seedProducts() {
  log('Seeding products (49 688 rows, in batches of 500)…');
  await Product.deleteMany({});

  let batchNum = 0;

  const total = await streamCSV(
    path.join(DATASET_DIR, 'products_with_images.csv'),
    BATCH_SIZE,
    async (rows, runningTotal) => {
      batchNum++;
      const docs = rows.map(row => ({
        product_id:      Number(row.product_id),
        product_name:    row.product_name,
        aisle_id:        Number(row.aisle_id),
        department_id:   Number(row.department_id),
        image_link:      row.image_link?.trim() || PLACEHOLDER_IMAGE,
        catalog_content: row.catalog_content?.trim() || '',
        price:           parseFloat(row.price) || 0,
      }));

      try {
        await Product.insertMany(docs, { ordered: false });
      } catch (err) {
        // ordered:false lets duplicates slide; log real errors
        if (err.code !== 11000) throw err;
      }

      if (batchNum % 10 === 0 || runningTotal >= 49500) {
        log(`  → ${runningTotal.toLocaleString()} products inserted…`);
      }
    }
  );

  log(`✔ Products seeded: ${total.toLocaleString()}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI not found in .env');
    process.exit(1);
  }

  log('Connecting to MongoDB Atlas…');
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  log('✔ Connected to Atlas cluster');

  const start = Date.now();

  await seedDepartments();
  await seedAisles();
  await seedProducts();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  log(`\n🎉  All done in ${elapsed}s`);

  // Quick verification counts
  const [pCount, aCount, dCount] = await Promise.all([
    Product.countDocuments(),
    Aisle.countDocuments(),
    Department.countDocuments(),
  ]);
  log(`Final DB counts — products: ${pCount.toLocaleString()} | aisles: ${aCount} | departments: ${dCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
