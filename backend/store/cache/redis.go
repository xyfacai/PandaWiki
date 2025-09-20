package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/chaitin/panda-wiki/config"
)

type Cache struct {
	*redis.Client
}

func NewCache(config *config.Config) (*Cache, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     config.Redis.Addr,
		Password: config.Redis.Password,
	})
	// test connection
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}
	return &Cache{
		Client: rdb,
	}, nil
}

func (cache *Cache) GetOrSet(ctx context.Context, key string, value interface{}, expiration time.Duration) (interface{}, error) {
	// Try to get the value from cache
	val, err := cache.Get(ctx, key).Result()
	if err == redis.Nil {
		// If not found, set the value
		if err := cache.Set(ctx, key, value, expiration).Err(); err != nil {
			return nil, err
		}
		return value, nil
	} else if err != nil {
		return nil, err
	}
	return val, nil
}

// DeleteKeysWithPrefix 删除所有指定前缀的 key
func (cache *Cache) DeleteKeysWithPrefix(ctx context.Context, prefix string) error {
	iter := cache.Scan(ctx, 0, prefix+"*", 0).Iterator()
	for iter.Next(ctx) {
		if err := cache.Del(ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}
	if err := iter.Err(); err != nil {
		return err
	}
	return nil
}

func (cache *Cache) AcquireLock(ctx context.Context, key string) bool {
	result, err := cache.SetNX(ctx, key, true, 10*time.Second).Result()
	if err != nil {
		return false
	}
	return result
}

func (cache *Cache) ReleaseLock(ctx context.Context, key string) bool {
	_, err := cache.Del(ctx, key).Result()
	return err == nil
}
