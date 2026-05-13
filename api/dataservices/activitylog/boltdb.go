package activitylog

import (
	"encoding/binary"
	"os"
	"path/filepath"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/segmentio/encoding/json"
	bolt "go.etcd.io/bbolt"
)

const (
	activityLogsBucket    = "activity_logs"
	authLogsBucket        = "auth_logs"
	activityLogBucketName = "activity_log_sequence"
	authLogBucketName     = "auth_log_sequence"
)

type BoltDataStore struct {
	db *bolt.DB
}

func NewBoltDataStore(dataPath string) (*BoltDataStore, error) {
	if err := os.MkdirAll(dataPath, 0700); err != nil {
		return nil, err
	}

	dbPath := filepath.Join(dataPath, "activitylogs.db")
	db, err := bolt.Open(dbPath, 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		return nil, err
	}

	store := &BoltDataStore{db: db}
	if err := store.migrate(); err != nil {
		return nil, err
	}

	return store, nil
}

func (s *BoltDataStore) migrate() error {
	return s.db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(activityLogsBucket))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(authLogsBucket))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(activityLogBucketName))
		if err != nil {
			return err
		}
		_, err = tx.CreateBucketIfNotExists([]byte(authLogBucketName))
		return err
	})
}

func (s *BoltDataStore) Close() error {
	return s.db.Close()
}

type BoltActivityLogService struct {
	db *bolt.DB
}

func NewBoltActivityLogService(store *BoltDataStore) *BoltActivityLogService {
	return &BoltActivityLogService{db: store.db}
}

func (s *BoltActivityLogService) Create(log *ActivityLog) error {
	if log.CreatedAt == 0 {
		log.CreatedAt = time.Now().UnixMilli()
	}
	if log.Timestamp == 0 {
		log.Timestamp = log.CreatedAt
	}

	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		seqBucket := tx.Bucket([]byte(activityLogBucketName))

		id, _ := seqBucket.NextSequence()
		log.ID = int64(id)

		key := make([]byte, 8)
		binary.BigEndian.PutUint64(key, id)

		data, err := json.Marshal(log)
		if err != nil {
			return err
		}

		return bucket.Put(key, data)
	})
}

func (s *BoltActivityLogService) Read(id int64) (*ActivityLog, error) {
	var result ActivityLog
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		key := make([]byte, 8)
		binary.BigEndian.PutUint64(key, uint64(id))
		data := bucket.Get(key)
		if data == nil {
			return nil
		}
		return json.Unmarshal(data, &result)
	})
	return &result, err
}

func (s *BoltActivityLogService) ReadAll(offset, limit int) ([]*ActivityLog, error) {
	var logs []*ActivityLog
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		cursor := bucket.Cursor()

		i := 0
		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			if i >= offset {
				var log ActivityLog
				if err := json.Unmarshal(v, &log); err != nil {
					return err
				}
				logs = append(logs, &log)
				if limit > 0 && len(logs) >= limit {
					break
				}
			}
			i++
		}
		return nil
	})
	return logs, err
}

func (s *BoltActivityLogService) ReadByTimerange(start, end int64, offset, limit int) ([]*ActivityLog, error) {
	var logs []*ActivityLog
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		cursor := bucket.Cursor()

		i := 0
		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			var log ActivityLog
			if err := json.Unmarshal(v, &log); err != nil {
				continue
			}
			if log.Timestamp >= start && log.Timestamp <= end {
				if i >= offset {
					logs = append(logs, &log)
					if limit > 0 && len(logs) >= limit {
						break
					}
				}
				i++
			}
		}
		return nil
	})
	return logs, err
}

func (s *BoltActivityLogService) Count() (int, error) {
	var count int
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		count = bucket.Stats().KeyN
		return nil
	})
	return count, err
}

func (s *BoltActivityLogService) CountByTimerange(start, end int64) (int, error) {
	var count int
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		cursor := bucket.Cursor()

		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			var log ActivityLog
			if err := json.Unmarshal(v, &log); err != nil {
				continue
			}
			if log.Timestamp >= start && log.Timestamp <= end {
				count++
			}
		}
		return nil
	})
	return count, err
}

func (s *BoltActivityLogService) Delete(id int64) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		key := make([]byte, 8)
		binary.BigEndian.PutUint64(key, uint64(id))
		return bucket.Delete(key)
	})
}

func (s *BoltActivityLogService) DeleteOlderThan(timestamp int64) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(activityLogsBucket))
		cursor := bucket.Cursor()

		var keysToDelete [][]byte
		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			var log ActivityLog
			if err := json.Unmarshal(v, &log); err != nil {
				continue
			}
			if log.Timestamp < timestamp {
				keysToDelete = append(keysToDelete, k)
			}
		}

		for _, key := range keysToDelete {
			if err := bucket.Delete(key); err != nil {
				return err
			}
		}
		return nil
	})
}

type BoltAuthLogService struct {
	db *bolt.DB
}

func NewBoltAuthLogService(store *BoltDataStore) *BoltAuthLogService {
	return &BoltAuthLogService{db: store.db}
}

func (s *BoltAuthLogService) Create(log *AuthLog) error {
	if log.CreatedAt == 0 {
		log.CreatedAt = time.Now().UnixMilli()
	}
	if log.Timestamp == 0 {
		log.Timestamp = log.CreatedAt
	}

	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		seqBucket := tx.Bucket([]byte(authLogBucketName))

		id, _ := seqBucket.NextSequence()
		log.ID = int64(id)

		key := make([]byte, 8)
		binary.BigEndian.PutUint64(key, id)

		data, err := json.Marshal(log)
		if err != nil {
			return err
		}

		return bucket.Put(key, data)
	})
}

func (s *BoltAuthLogService) Read(id int64) (*AuthLog, error) {
	var result AuthLog
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		key := make([]byte, 8)
		binary.BigEndian.PutUint64(key, uint64(id))
		data := bucket.Get(key)
		if data == nil {
			return nil
		}
		return json.Unmarshal(data, &result)
	})
	return &result, err
}

func (s *BoltAuthLogService) ReadAll(offset, limit int) ([]*AuthLog, error) {
	var logs []*AuthLog
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		cursor := bucket.Cursor()

		i := 0
		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			if i >= offset {
				var log AuthLog
				if err := json.Unmarshal(v, &log); err != nil {
					return err
				}
				logs = append(logs, &log)
				if limit > 0 && len(logs) >= limit {
					break
				}
			}
			i++
		}
		return nil
	})
	return logs, err
}

func (s *BoltAuthLogService) ReadByTimerange(start, end int64, offset, limit int) ([]*AuthLog, error) {
	var logs []*AuthLog
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		cursor := bucket.Cursor()

		i := 0
		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			var log AuthLog
			if err := json.Unmarshal(v, &log); err != nil {
				continue
			}
			if log.Timestamp >= start && log.Timestamp <= end {
				if i >= offset {
					logs = append(logs, &log)
					if limit > 0 && len(logs) >= limit {
						break
					}
				}
				i++
			}
		}
		return nil
	})
	return logs, err
}

func (s *BoltAuthLogService) Count() (int, error) {
	var count int
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		count = bucket.Stats().KeyN
		return nil
	})
	return count, err
}

func (s *BoltAuthLogService) CountByTimerange(start, end int64) (int, error) {
	var count int
	err := s.db.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		cursor := bucket.Cursor()

		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			var log AuthLog
			if err := json.Unmarshal(v, &log); err != nil {
				continue
			}
			if log.Timestamp >= start && log.Timestamp <= end {
				count++
			}
		}
		return nil
	})
	return count, err
}

func (s *BoltAuthLogService) Delete(id int64) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		key := make([]byte, 8)
		binary.BigEndian.PutUint64(key, uint64(id))
		return bucket.Delete(key)
	})
}

func (s *BoltAuthLogService) DeleteOlderThan(timestamp int64) error {
	return s.db.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(authLogsBucket))
		cursor := bucket.Cursor()

		var keysToDelete [][]byte
		for k, v := cursor.Last(); k != nil; k, v = cursor.Prev() {
			var log AuthLog
			if err := json.Unmarshal(v, &log); err != nil {
				continue
			}
			if log.Timestamp < timestamp {
				keysToDelete = append(keysToDelete, k)
			}
		}

		for _, key := range keysToDelete {
			if err := bucket.Delete(key); err != nil {
				return err
			}
		}
		return nil
	})
}

type Service struct {
	ActivityLogService ActivityLogService
	AuthLogService     AuthLogService
	store              *BoltDataStore
}

func NewService(dbPath string) (*Service, error) {
	store, err := NewBoltDataStore(dbPath)
	if err != nil {
		return nil, err
	}

	return &Service{
		ActivityLogService: NewBoltActivityLogService(store),
		AuthLogService:     NewBoltAuthLogService(store),
		store:              store,
	}, nil
}

func (s *Service) Close() error {
	return s.store.Close()
}

func (s *Service) DeleteOldLogs(retentionDays int) error {
	cutoff := time.Now().AddDate(0, 0, -retentionDays).UnixMilli()
	if err := s.ActivityLogService.DeleteOlderThan(cutoff); err != nil {
		log.Warn().Err(err).Msg("failed to delete old activity logs")
		return err
	}
	if err := s.AuthLogService.DeleteOlderThan(cutoff); err != nil {
		log.Warn().Err(err).Msg("failed to delete old auth logs")
		return err
	}
	return nil
}
