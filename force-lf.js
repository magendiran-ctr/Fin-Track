const fs = require('fs');

function fixFile(path, content) {
    const lfContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    fs.writeFileSync(path, lfContent, { encoding: 'utf8' });
    console.log(`Fixed ${path}`);
}

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model User {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  expenses  Expense[]
}

model Expense {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  amount    Float
  category  String
  date      DateTime
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  userId    String   @db.ObjectId
  user      User     @relation(fields: [userId], references: [id])
}
`;

const env = `DATABASE_URL="mongodb://localhost:27017/expense_tracker"
JWT_SECRET="expense-tracker-secret-key-change-in-production"
`;

fixFile('prisma/schema.prisma', schema);
fixFile('.env', env);
