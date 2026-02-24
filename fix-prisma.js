const fs = require('fs');

function fixFile(path, content) {
    const crlfContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
    fs.writeFileSync(path, crlfContent, { encoding: 'utf8' });
    console.log(`Fixed ${path}`);
}

const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = "mongodb://localhost:27017/expense_tracker"
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

fixFile('prisma/schema.prisma', schema);
