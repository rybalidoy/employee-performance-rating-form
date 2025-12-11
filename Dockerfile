FROM oven/bun:1-alpine

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source file (through they will be mounted via volume in compose for hot reload)
COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]

