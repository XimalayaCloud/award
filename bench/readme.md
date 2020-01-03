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

> 压测机器`MacBook Pro (13-inch, 2017, Two Thunderbolt 3 ports)`
> 
> 2.3 GHz Intel Core i5
> 
> 8 GB 2133 MHz LPDDR3
>
> node `v12.13.1`

## less

**`ab -c1 -n3000 http://0.0.0.0:3000/stateless`**

| 参数             | award      | next       |
| :--------------- | :--------- | :--------- |
| qps              | 2799.49    | 2729.75    |
| Time per request | 0.357 [ms] | 0.366 [ms] |

## big

**`ab -c1 -n3000 http://0.0.0.0:3000/stateless-big`**

| 参数             | award       | next        |
| :--------------- | :---------- | :---------- |
| qps              | 54.44       | 51.39       |
| Time per request | 18.369 [ms] | 19.458 [ms] |
