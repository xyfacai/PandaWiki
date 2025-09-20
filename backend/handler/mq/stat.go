package mq

import (
	"context"

	"github.com/robfig/cron/v3"

	"github.com/chaitin/panda-wiki/log"
	"github.com/chaitin/panda-wiki/repo/pg"
	"github.com/chaitin/panda-wiki/usecase"
)

type StatCronHandler struct {
	logger      *log.Logger
	statRepo    *pg.StatRepository
	statUseCase *usecase.StatUseCase
}

func NewStatCronHandler(logger *log.Logger, statRepo *pg.StatRepository, statUseCase *usecase.StatUseCase) (*StatCronHandler, error) {
	h := &StatCronHandler{
		statRepo:    statRepo,
		statUseCase: statUseCase,
		logger:      logger.WithModule("handler.mq.stat"),
	}
	cron := cron.New()

	// 每小时 */10 分执行聚合统计数据任务
	if _, err := cron.AddFunc("*/10 */1 * * *", h.AggregateHourlyStats); err != nil {
		h.logger.Error("failed to add cron job for aggregating hourly stats", log.Error(err))
		return nil, err
	}
	h.logger.Info("add cron job", log.String("cron_id", "aggregate_hourly_stats"))

	// 每小时1分执行清理旧数据任务
	if _, err := cron.AddFunc("1 */1 * * *", h.RemoveOldStatData); err != nil {
		h.logger.Error("failed to add cron job for removing old data", log.Error(err))
		return nil, err
	}
	h.logger.Info("add cron job", log.String("cron_id", "remove_old_stat_data"))

	// 每天0点执行清理90天前的小时统计数据
	if _, err := cron.AddFunc("3 0 * * *", h.CleanupOldHourlyStats); err != nil {
		h.logger.Error("failed to add cron job for cleaning up old hourly stats", log.Error(err))
		return nil, err
	}
	h.logger.Info("add cron job", log.String("cron_id", "cleanup_old_hourly_stats"))

	cron.Start()
	h.logger.Info("start cron jobs")
	return h, nil
}

func (h *StatCronHandler) RemoveOldStatData() {
	h.logger.Info("remove old stat data start")
	err := h.statRepo.RemoveOldData(context.Background())
	if err != nil {
		h.logger.Error("remove old stat data failed", log.Error(err))
	}
	h.logger.Info("remove old stat data successful")
}

func (h *StatCronHandler) AggregateHourlyStats() {
	h.logger.Info("aggregate hourly stats start")
	err := h.statUseCase.AggregateHourlyStats(context.Background())
	if err != nil {
		h.logger.Error("aggregate hourly stats failed", log.Error(err))
		return
	}
	h.logger.Info("aggregate hourly stats successful")
}

func (h *StatCronHandler) CleanupOldHourlyStats() {
	h.logger.Info("cleanup old hourly stats start")
	err := h.statUseCase.CleanupOldHourlyStats(context.Background())
	if err != nil {
		h.logger.Error("cleanup old hourly stats failed", log.Error(err))
		return
	}
	h.logger.Info("cleanup old hourly stats successful")
}
