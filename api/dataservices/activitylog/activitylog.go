package activitylog

type ActivityLogService interface {
	Create(log *ActivityLog) error
	Read(id int64) (*ActivityLog, error)
	ReadAll(offset, limit int) ([]*ActivityLog, error)
	ReadByTimerange(start, end int64, offset, limit int) ([]*ActivityLog, error)
	Count() (int, error)
	CountByTimerange(start, end int64) (int, error)
	Delete(id int64) error
	DeleteOlderThan(timestamp int64) error
}

type AuthLogService interface {
	Create(log *AuthLog) error
	Read(id int64) (*AuthLog, error)
	ReadAll(offset, limit int) ([]*AuthLog, error)
	ReadByTimerange(start, end int64, offset, limit int) ([]*AuthLog, error)
	Count() (int, error)
	CountByTimerange(start, end int64) (int, error)
	Delete(id int64) error
	DeleteOlderThan(timestamp int64) error
}
