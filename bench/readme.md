# Award server-side benchmarks

Both benchmarks use ab. So make sure you have that installed.

# Usage

## 压测Award项目

- 压测无路由项目

```sh
# 启动
npm run start

# 开个终端进行压测
npm run bench > bench.award
```

- 压测路由项目

```sh
# 启动
npm run start:big

# 开个终端进行压测
npm run bench:big > bench.big.award
```

## 压测next项目

- 压测无路由项目

```sh
# 启动
npm run start:next

# 开个终端进行压测
npm run bench > bench.next

# 测试路由项目
npm run bench:big > bench.big.next
```

# 对比

## less

**`ab -c1 -n3000 http://0.0.0.0:3000/stateless`**

| 参数 | award   | next    |
| :--- | :------ | :------ |
| qps  | 2117.46 | 2019.95 |
| Time per request  | 0.472 [ms] | 0.495 [ms] |

## big

**`ab -c1 -n3000 http://0.0.0.0:3000/stateless-big`**

| 参数 | award   | next    |
| :--- | :------ | :------ |
| qps  | 46.56 | 50.63 |
| Time per request  | 21.477 [ms] | 19.752 [ms] |
