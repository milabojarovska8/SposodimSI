# Slika za produkcijo. Ne gradi aplikacije: v sliko le prekopira paket aplikacije,
# ki ga je pripravil job "build" (backend z odvisnostmi in zgrajeni frontend v public/).
FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY . .

# Render nastavi PORT; ob zagonu se po potrebi pripravi baza, nato se zažene strežnik
EXPOSE 10000
CMD ["sh", "-c", "node src/init-db.js && node src/server.js"]
