package domain

const (
	// Vector topic (unidirectional)
	VectorTaskTopic = "apps.panda-wiki.vector.task"
)

var TopicConsumerName = map[string]string{
	VectorTaskTopic: "panda-wiki-vector-consumer",
}

type NodeReleaseVectorRequest struct {
	KBID          string `json:"kb_id"`
	NodeReleaseID string `json:"node_release_id"`
	NodeID        string `json:"node_id"`
	DocID         string `json:"doc_id"` // for delete
	Action        string `json:"action"` // upsert, delete, summary
	GroupIds      []int  `json:"group_ids"`
}
