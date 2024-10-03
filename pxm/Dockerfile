FROM public.ecr.aws/patterninc/parent-image/nodejs:18

ARG NODE_ENV
ARG NPM_TOKEN

ENV NODE_ENV $NODE_ENV

WORKDIR /var/apps/web
COPY ./ /var/apps/web

COPY ./package.json /var/apps/package.json

# Copy the pnpm version file and set the version as an environment variable
COPY .pnpmversion ./

RUN export PNPM_VERSION=$(cat .pnpmversion)

# Install pnpm using the version specified in the .pnpmversion file
RUN npm install -g pnpm@9.5.0

# Copy pnpm-lock.yaml
COPY pnpm-lock.yaml /var/apps/pnpm-lock.yaml

RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" > .npmrc && \
    echo "@ampmedia:registry=https://npm.pkg.github.com" >> .npmrc && \
    pnpm install --ignore-scripts && \
    rm -f .npmrc

RUN pnpm build
ENV PORT 3000
RUN mkdir -p  /logs/Client
CMD pnpm start --skip-nx-cache
