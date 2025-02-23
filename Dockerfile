FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

ARG DISCORD_TOKEN
ARG OTHER_VARIABLE
RUN echo "DISCORD_TOKEN=${DISCORD_TOKEN}" > .env && \
    echo "OTHER_VARIABLE=${OTHER_VARIABLE}" >> .env

ENV DISCORD_TOKEN=${DISCORD_TOKEN}
ENV OTHER_VARIABLE=${OTHER_VARIABLE}

# Expose the port your app runs on (if needed)
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]