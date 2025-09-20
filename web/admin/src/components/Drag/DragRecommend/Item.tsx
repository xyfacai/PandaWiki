import { postApiV1NodeSummary } from '@/request/Node';
import { DomainRecommendNodeListResp } from '@/request/types';
import { useAppSelector } from '@/store';
import { Box, IconButton, Stack } from '@mui/material';
import { Ellipsis, Icon, message } from '@ctzhian/ui';
import { CSSProperties, forwardRef, HTMLAttributes, useState } from 'react';

export type ItemProps = HTMLAttributes<HTMLDivElement> & {
  item: DomainRecommendNodeListResp;
  withOpacity?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
  handleRemove?: (id: string) => void;
  refresh?: () => void;
};

const Item = forwardRef<HTMLDivElement, ItemProps>(
  (
    {
      item,
      withOpacity,
      isDragging,
      style,
      dragHandleProps,
      handleRemove,
      refresh,
      ...props
    },
    ref,
  ) => {
    const { kb_id } = useAppSelector(state => state.config);
    const inlineStyles: CSSProperties = {
      opacity: withOpacity ? '0.5' : '1',
      borderRadius: '10px',
      cursor: isDragging ? 'grabbing' : 'grab',
      backgroundColor: '#ffffff',
      width: '100%',
      minWidth: '0px',
      ...style,
    };
    const [loading, setLoading] = useState(false);

    const handleCreateSummary = () => {
      setLoading(true);
      postApiV1NodeSummary({ ids: [item.id!], kb_id })
        .then(() => {
          message.success('生成摘要成功');
          refresh?.();
        })
        .finally(() => {
          setLoading(false);
        });
    };

    return (
      <Box ref={ref} style={inlineStyles} {...props}>
        <Stack
          direction={'row'}
          gap={1}
          sx={{
            p: 1,
            height: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              flexGrow: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
            }}
          >
            <Stack direction={'row'} alignItems={'center'} gap={1}>
              <Icon
                type={item.type === 1 ? 'icon-wenjianjia' : 'icon-wenjian'}
                sx={{ fontSize: 14, color: '#2f80f7', flexShrink: 0 }}
              />
              <Ellipsis sx={{ flex: 1, width: 0, lineHeight: '32px' }}>
                {item.name}
              </Ellipsis>
            </Stack>
            {item.summary ? (
              <Box
                className='ellipsis-5'
                sx={{
                  fontSize: 14,
                  color: 'text.tertiary',
                  lineHeight: '21px',
                }}
              >
                {item.summary}
              </Box>
            ) : item.type === 2 ? (
              <Box
                sx={{ color: 'warning.main', fontSize: 12, lineHeight: '21px' }}
              >
                暂无摘要，可前往文档页生成并发布
              </Box>
            ) : null}
            {/* : item.type === 2 ? <Button size='small' loading={loading} sx={{
            height: '21px',
            px: 0,
            ml: '18px',
          }} onClick={handleCreateSummary}>生成摘要</Button> : null} */}
            {item.recommend_nodes && item.recommend_nodes.length > 0 && (
              <Stack sx={{ fontSize: 14, color: 'text.tertiary', pl: '20px' }}>
                {item.recommend_nodes
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .slice(0, 4)
                  .map(it => (
                    <Stack direction={'row'} alignItems={'center'} gap={1}>
                      <Icon
                        type={
                          it.type === 1 ? 'icon-wenjianjia' : 'icon-wenjian'
                        }
                        sx={{ fontSize: 14, color: '#2f80f7', flexShrink: 0 }}
                      />
                      <Ellipsis sx={{ flex: 1, width: 0 }}>{it.name}</Ellipsis>
                    </Stack>
                  ))}
              </Stack>
            )}
          </Box>
          <Stack justifyContent={'space-between'} sx={{ flexShrink: 0 }}>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation();
                handleRemove?.(item.id!);
              }}
              sx={{
                color: 'text.tertiary',
                ':hover': { color: 'error.main' },
              }}
            >
              <Icon type='icon-icon_tool_close' />
            </IconButton>
            <IconButton
              size='small'
              sx={{
                cursor: 'grab',
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
              {...dragHandleProps}
            >
              <Icon type='icon-drag' />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    );
  },
);

export default Item;
