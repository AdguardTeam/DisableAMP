# syntax=docker/dockerfile:1.6

FROM adguard/node-ssh:22.22--0 AS base
WORKDIR /workdir
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

FROM base AS deps
RUN --mount=type=cache,target=/pnpm-store,id=disable-amp-pnpm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=.husky,target=.husky \
    pnpm install --frozen-lockfile --store-dir /pnpm-store

FROM base AS source-deps
COPY --from=deps /workdir/node_modules ./node_modules
COPY . .

# =============================================================================
# Test plan
# =============================================================================

FROM mcr.microsoft.com/playwright:v1.59.1-noble AS test-base
ARG PNPM_VERSION=10.33.2
WORKDIR /workdir
ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
RUN npm install --global "pnpm@${PNPM_VERSION}"

FROM test-base AS test-deps
RUN --mount=type=cache,target=/pnpm-store,id=disable-amp-pnpm \
    --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=.husky,target=.husky \
    pnpm install --frozen-lockfile --store-dir /pnpm-store

FROM test-base AS test
ARG TEST_RUN_ID
COPY --from=test-deps /workdir/node_modules ./node_modules
COPY . .
RUN echo "test run id: ${TEST_RUN_ID}" && \
    pnpm run lint && \
    pnpm run dev && \
    pnpm run test

FROM scratch AS test-output
COPY --from=test /workdir/build/dev/disable-amp.meta.js /artifacts/disable-amp.meta.js
COPY --from=test /workdir/build/dev/disable-amp.user.js /artifacts/disable-amp.user.js

# =============================================================================
# Build beta plan
# =============================================================================

FROM source-deps AS build-beta
RUN pnpm run beta

FROM scratch AS build-beta-output
COPY --from=build-beta /workdir/build/beta/variables.txt /artifacts/variables.txt
COPY --from=build-beta /workdir/build/beta/disable-amp.meta.js /artifacts/disable-amp.meta.js
COPY --from=build-beta /workdir/build/beta/disable-amp.user.js /artifacts/disable-amp.user.js

# =============================================================================
# Build release plan
# =============================================================================

FROM source-deps AS build-release
RUN pnpm run release

FROM scratch AS build-release-output
COPY --from=build-release /workdir/build/release/variables.txt /artifacts/variables.txt
COPY --from=build-release /workdir/build/release/disable-amp.meta.js /artifacts/disable-amp.meta.js
COPY --from=build-release /workdir/build/release/disable-amp.user.js /artifacts/disable-amp.user.js

# Alias used by publish-release.yml to fetch the compiled release userscript.
FROM build-release-output AS build-output
