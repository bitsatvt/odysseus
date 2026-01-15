# Odysseus Advisor

We welcome any contributions from the community!

To get started on developing Advisor, you will need the following tools
installed:

- NodeJS v22+ (NextJS App)
- Docker (Containerization)
- Git (Version control)

After installing the tools, type these commands in your shell:

1. Clone the repository and go into directory

   ```
   git clone https://github.com/bitsatvt/odysseus
   cd odysseus
   ```

2. Start docker containers

   ```
   docker compose up -d
   ```

3. Install necessary packages

   ```
   cd web
   npm install
   ```

4. Initialize the search index

   ```
   npm run init-search
   ```

5. Initialize the database (this might take a while, you may continue on
   working while this loads):

   ```
   npx prisma generate
   npx prisma db seed
   ```

6. Start the development server

   ```
   npm run dev
   ```

You should now be able to navigate to
[http://localhost:3000](http://localhost:3000) and browse the website.

