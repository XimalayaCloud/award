# Award server-side benchmarks

Both benchmarks use ab. So make sure you have that installed.

# Usage

## 压测Award框架

```sh
# 启动
npm run start:award

# 压测less页面
npm run less:award

# 压测big页面
npm run big:award
```

## 压测next框架

```sh
# 启动
npm run start:next

# 压测less页面
npm run less:next

# 压测big页面
npm run big:next
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
| qps              | 2311.26    | 2728.05    |
| Time per request | 0.433 [ms] | 0.367 [ms] |

## big

**`ab -c1 -n3000 http://0.0.0.0:3000/stateless-big`**

| 参数             | award       | next        |
| :--------------- | :---------- | :---------- |
| qps              | 54.46       | 50.56       |
| Time per request | 18.361 [ms] | 19.777 [ms] |
