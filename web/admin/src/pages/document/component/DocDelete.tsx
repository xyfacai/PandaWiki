import { postApiV1NodeAction } from '@/request/Node';
import { DomainNodeListItemResp } from '@/request/types';
import Card from '@/components/Card';
import DragTree from '@/components/Drag/DragTree';
import { useAppSelector } from '@/store';
import { convertToTree } from '@/utils/drag';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Stack } from '@mui/material';
import { message, Modal } from '@ctzhian/ui';

interface DocDeleteProps {
  open: boolean;
  onClose: () => void;
  data: DomainNodeListItemResp[];
  refresh?: () => void;
}

const DocDelete = ({ open, onClose, data, refresh }: DocDeleteProps) => {
  const { kb_id } = useAppSelector(state => state.config);
  if (!data) return null;

  const submit = () => {
    postApiV1NodeAction({
      ids: data.map(item => item.id!),
      kb_id,
      action: 'delete',
    }).then(() => {
      message.success('删除成功');
      onClose();
      refresh?.();
    });
  };

  const tree = convertToTree(data);

  return (
    <Modal
      title={
        <Stack direction='row' alignItems='center' gap={1}>
          <ErrorOutlineIcon sx={{ color: 'warning.main' }} />
          确认删除以下文档/文件夹？
        </Stack>
      }
      open={open}
      width={600}
      okText='删除'
      okButtonProps={{ sx: { bgcolor: 'error.main' } }}
      onCancel={onClose}
      onOk={submit}
    >
      <Card
        sx={{
          py: 1,
          bgcolor: 'background.paper3',
          '& .dndkit-drag-handle': {
            top: '-2px !important',
          },
        }}
      >
        <DragTree data={tree} readOnly={true} supportSelect={false} />
      </Card>
    </Modal>
  );
};

export default DocDelete;
