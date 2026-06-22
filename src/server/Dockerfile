# Stage 1: Build the C++ server
FROM gcc:latest AS builder

RUN apt-get update && apt-get install -y cmake

WORKDIR /app

# copy everything from root context
COPY . .

RUN mkdir -p build && cd build && cmake .. && make

# Stage 2: Runtime
FROM ubuntu:latest

WORKDIR /app

RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/build/app .

# data dir must exist for FileDataManager (path is ../data/ relative to the build dir)
RUN mkdir -p /data

EXPOSE 8080

ENTRYPOINT ["./app"]
CMD ["8080"]
