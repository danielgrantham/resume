FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

COPY src/ ./src/
COPY public/ ./public/

RUN mkdir -p data
RUN bun build src/client/main.ts --outdir dist --minify
RUN cp src/client/styles/main.css dist/main.css

ENV PORT=8080
EXPOSE 8080

CMD ["bun", "run", "src/server/index.ts"]
