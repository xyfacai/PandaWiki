import { updateKnowledgeBase } from '@/api';
import {
  deleteApiV1KnowledgeBaseUserDelete,
  getApiV1KnowledgeBaseUserList,
  patchApiV1KnowledgeBaseUserUpdate,
} from '@/request/KnowledgeBase';
import NoData from '@/assets/images/nodata.png';
import { Form, FormItem } from './Common';
import {
  ConstsUserKBPermission,
  DomainKnowledgeBaseDetail,
  DomainAppDetailResp,
  V1KBUserListItemResp,
  V1KBUserUpdateReq,
} from '@/request/types';
import {
  GithubComChaitinPandaWikiProApiTokenV1APITokenListItem,
  GithubComChaitinPandaWikiProApiTokenV1CreateAPITokenReq,
} from '@/request/pro/types';
import {
  postApiProV1TokenCreate,
  patchApiProV1TokenUpdate,
  getApiProV1TokenList,
  deleteApiProV1TokenDelete,
} from '@/request/pro/ApiToken';
import { useAppSelector } from '@/store';
import { setKbList } from '@/store/slices/config';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  styled,
} from '@mui/material';
import { copyText } from '@/utils';
import { Ellipsis, Icon, message, Modal } from '@ctzhian/ui';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import AddRole from './AddRole';
import { Controller, useForm } from 'react-hook-form';
import { setRefreshAdminRequest } from '@/store/slices/config';
import { SettingCard, SettingCardItem } from './Common';

interface CardKBProps {
  kb: DomainKnowledgeBaseDetail;
  data?: DomainAppDetailResp;
}

type ApiTokenPermission =
  GithubComChaitinPandaWikiProApiTokenV1CreateAPITokenReq['permission'];

function maskString(str: string) {
  const start = str.slice(0, 6);
  const end = str.slice(-6);
  const middle = '*'.repeat(22);

  return start + middle + end;
}

const ApiToken = () => {
  const [addOpen, setAddOpen] = useState(false);
  const { license, kb_id, user, kbDetail } = useAppSelector(
    state => state.config,
  );
  const [apiTokenList, setApiTokenList] = useState<
    GithubComChaitinPandaWikiProApiTokenV1APITokenListItem[]
  >([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      perm: ConstsUserKBPermission.UserKBPermissionFullControl,
    },
  });
  const isEnterprise = useMemo(() => {
    return license.edition === 2;
  }, [license]);

  const onDeleteApiToken = (id: string, name: string) => {
    Modal.confirm({
      title: '删除 API Token',
      content: (
        <>
          确定删除{' '}
          <Box component='span' sx={{ fontWeight: 700, color: 'text.primary' }}>
            {name}
          </Box>{' '}
          这个 API Token 吗？
        </>
      ),
      okButtonProps: {
        color: 'error',
      },
      onOk: () => {
        deleteApiProV1TokenDelete({
          id,
          kb_id,
        }).then(() => {
          message.success('删除成功');
          getApiTokenList();
        });
      },
    });
  };

  const onUpdateApiToken = (id: string, permission: ApiTokenPermission) => {
    patchApiProV1TokenUpdate({
      id,
      kb_id,
      permission,
    }).then(() => {
      message.success('更新成功');
      getApiTokenList();
    });
  };

  const onConfirmAdd = handleSubmit(data => {
    postApiProV1TokenCreate({
      kb_id,
      name: data.name,
      permission: data.perm as ApiTokenPermission,
    }).then(() => {
      getApiTokenList();
      setAddOpen(false);
    });
  });

  const getApiTokenList = () => {
    getApiProV1TokenList({
      kb_id,
    }).then(res => {
      setApiTokenList(res || []);
    });
  };

  useEffect(() => {
    if (!kb_id) return;
    getApiTokenList();
  }, [kb_id]);

  useEffect(() => {
    if (!addOpen) reset();
  }, [addOpen]);

  return (
    <SettingCardItem
      title='API Token'
      extra={
        <Stack direction={'row'} alignItems={'center'}>
          <Button
            color='primary'
            size='small'
            disabled={!isEnterprise}
            onClick={() => setAddOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            创建 API Token
          </Button>

          <Tooltip title={'企业版可用'} placement='top' arrow>
            <InfoIcon
              sx={{
                color: 'text.secondary',
                fontSize: 14,
                display: !isEnterprise ? 'block' : 'none',
              }}
            />
          </Tooltip>
        </Stack>
      }
    >
      <Box
        sx={{
          borderRadius: '10px',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          maxHeight: 300,
        }}
      >
        {apiTokenList.map((it, idx) => (
          <Stack
            key={idx}
            direction={'row'}
            alignItems={'center'}
            gap={3}
            justifyContent={'space-between'}
            sx={{
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-of-type': {
                borderBottom: 'none',
              },
            }}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              gap={2}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <Ellipsis sx={{ fontSize: 14 }}>{it.name}</Ellipsis>
            </Stack>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              gap={1}
              sx={{
                pt: 0.5,
                px: 1,
                bgcolor: 'background.paper3',
                borderRadius: 1,
                fontSize: 12,
                color: 'text.tertiary',
                width: 236,
              }}
            >
              {maskString(it.token!)}
              <Icon
                type='icon-fuzhi'
                sx={{
                  cursor: 'pointer',
                  fontSize: 16,
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() => copyText(it.token!)}
              />
            </Stack>

            <Stack direction={'row'} alignItems={'center'}>
              <Select
                size='small'
                sx={{ width: 120 }}
                value={it.permission}
                disabled={!isEnterprise || user.role !== 'admin'}
                onChange={e =>
                  onUpdateApiToken(it.id!, e.target.value as ApiTokenPermission)
                }
              >
                <MenuItem
                  value={ConstsUserKBPermission.UserKBPermissionFullControl}
                >
                  完全控制
                </MenuItem>
                <MenuItem
                  value={ConstsUserKBPermission.UserKBPermissionDocManage}
                >
                  文档管理
                </MenuItem>
                <MenuItem
                  value={ConstsUserKBPermission.UserKBPermissionDataOperate}
                >
                  数据运营
                </MenuItem>
              </Select>

              <Tooltip
                title={
                  kbDetail?.perm !==
                  ConstsUserKBPermission.UserKBPermissionFullControl
                    ? '权限不足'
                    : '企业版可用'
                }
                placement='top'
                arrow
              >
                <InfoIcon
                  sx={{
                    color: 'text.secondary',
                    fontSize: 14,
                    ml: 1,
                    visibility:
                      !isEnterprise ||
                      kbDetail?.perm !==
                        ConstsUserKBPermission.UserKBPermissionFullControl
                        ? 'visible'
                        : 'hidden',
                  }}
                />
              </Tooltip>
            </Stack>

            <Tooltip title={user.role !== 'admin' && ''} placement='top' arrow>
              <Icon
                type='icon-icon_tool_close'
                sx={{
                  cursor:
                    !isEnterprise ||
                    kbDetail?.perm !==
                      ConstsUserKBPermission.UserKBPermissionFullControl
                      ? 'not-allowed'
                      : 'pointer',
                  color:
                    !isEnterprise ||
                    kbDetail?.perm !==
                      ConstsUserKBPermission.UserKBPermissionFullControl
                      ? 'text.disabled'
                      : 'error.main',
                }}
                onClick={() => {
                  if (
                    !isEnterprise ||
                    kbDetail?.perm !==
                      ConstsUserKBPermission.UserKBPermissionFullControl
                  )
                    return;
                  onDeleteApiToken(it.id!, it.name!);
                }}
              />
            </Tooltip>
          </Stack>
        ))}

        {apiTokenList.length === 0 && (
          <Stack
            alignItems={'center'}
            sx={{ my: 2, fontSize: 14, color: 'text.tertiary' }}
          >
            <img src={NoData} width={104} />
            <Box>暂无数据</Box>
          </Stack>
        )}
      </Box>
      <Modal
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        title='创建 API Token'
        onOk={onConfirmAdd}
      >
        <Form vertical>
          <FormItem label='API Token 备注' required>
            <Controller
              control={control}
              name='name'
              rules={{
                required: 'API Token 备注不能为空',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  placeholder='请输入'
                  helperText={errors.name?.message}
                  error={!!errors.name}
                />
              )}
            />
          </FormItem>
          <FormItem label='权限'>
            <Controller
              control={control}
              name='perm'
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    sx={{ height: 52 }}
                    fullWidth
                    onChange={e =>
                      field.onChange(
                        e.target.value as V1KBUserUpdateReq['perm'],
                      )
                    }
                  >
                    <MenuItem
                      value={ConstsUserKBPermission.UserKBPermissionFullControl}
                    >
                      完全控制
                    </MenuItem>
                    <MenuItem
                      disabled={!isEnterprise}
                      value={ConstsUserKBPermission.UserKBPermissionDocManage}
                    >
                      文档管理 {isEnterprise ? '' : '(企业版可用)'}
                    </MenuItem>
                    <MenuItem
                      disabled={!isEnterprise}
                      value={ConstsUserKBPermission.UserKBPermissionDataOperate}
                    >
                      数据运营 {isEnterprise ? '' : '(企业版可用)'}
                    </MenuItem>
                  </Select>
                );
              }}
            ></Controller>
          </FormItem>
        </Form>
      </Modal>
    </SettingCardItem>
  );
};

const CardKB = ({ kb, data }: CardKBProps) => {
  const { kbList, kb_id, license } = useAppSelector(state => state.config);
  const dispatch = useDispatch();

  const [kbName, setKbName] = useState(kb.name);
  const [isEdit, setIsEdit] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [adminList, setAdminList] = useState<V1KBUserListItemResp[]>([]);

  const getUserList = () => {
    getApiV1KnowledgeBaseUserList({
      kb_id,
    }).then(res => {
      setAdminList(res || []);
    });
  };

  const isEnterprise = useMemo(() => {
    return license.edition === 2;
  }, [license]);

  useEffect(() => {
    if (!kb_id) return;
    getUserList();
  }, [kb_id]);

  const handleSave = () => {
    if (!kb.id) return;
    updateKnowledgeBase({ id: kb.id, name: kbName }).then(() => {
      message.success('保存成功');
      dispatch(
        setKbList(
          kbList?.map(item =>
            item.id === kb.id ? { ...item, name: kbName } : item,
          ),
        ),
      );
      setIsEdit(false);
    });
  };

  useEffect(() => {
    dispatch(setRefreshAdminRequest(getUserList));
  }, []);

  const onDeleteUser = (id: string) => {
    Modal.confirm({
      title: '删除管理员',
      content: '确定删除该管理员吗？',
      okButtonProps: {
        color: 'error',
      },
      onOk: () => {
        deleteApiV1KnowledgeBaseUserDelete({
          kb_id,
          user_id: id,
        }).then(() => {
          getUserList();
          message.success('删除成功');
        });
      },
    });
  };

  const onUpdateUserPermission = (
    id: string,
    perm: V1KBUserUpdateReq['perm'],
  ) => {
    patchApiV1KnowledgeBaseUserUpdate({
      kb_id,
      user_id: id,
      perm,
    }).then(() => {
      getUserList();
      message.success('更新成功');
    });
  };

  useEffect(() => {
    setKbName(kb.name);
  }, [kb]);

  return (
    <SettingCard title='后台信息'>
      <SettingCardItem
        title='Wiki 站名称'
        isEdit={isEdit}
        onSubmit={handleSave}
      >
        <TextField
          fullWidth
          value={kbName}
          onChange={e => {
            setKbName(e.target.value);
            setIsEdit(true);
          }}
        />
      </SettingCardItem>

      <SettingCardItem
        title='Wiki 站管理员'
        extra={
          <Button
            size='small'
            startIcon={<Icon type='icon-tianjiachengyuan' />}
            onClick={() => setAddOpen(true)}
            sx={{ color: 'primary.main' }}
          >
            添加 Wiki 站管理员
          </Button>
        }
      >
        <Box
          sx={{
            borderRadius: '10px',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'auto',
            maxHeight: 300,
          }}
        >
          {adminList.map((it, idx) => (
            <Stack
              key={idx}
              direction={'row'}
              alignItems={'center'}
              gap={8}
              justifyContent={'space-between'}
              sx={{
                px: 2,
                py: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-of-type': {
                  borderBottom: 'none',
                },
              }}
            >
              <Stack
                direction={'row'}
                alignItems={'center'}
                gap={2}
                sx={{ flex: 1, minWidth: 0 }}
              >
                {/* <Avatar sx={{ width: 20, height: 20 }} /> */}
                <Ellipsis sx={{ fontSize: 14 }}>{it.account}</Ellipsis>
              </Stack>

              <Stack direction={'row'} alignItems={'center'}>
                <Select
                  size='small'
                  sx={{ width: 180 }}
                  value={it.perms}
                  disabled={!isEnterprise || it.role === 'admin'}
                  onChange={e =>
                    onUpdateUserPermission(
                      it.id!,
                      e.target.value as V1KBUserUpdateReq['perm'],
                    )
                  }
                >
                  <MenuItem
                    value={ConstsUserKBPermission.UserKBPermissionFullControl}
                  >
                    完全控制
                  </MenuItem>
                  <MenuItem
                    value={ConstsUserKBPermission.UserKBPermissionDocManage}
                  >
                    文档管理
                  </MenuItem>
                  <MenuItem
                    value={ConstsUserKBPermission.UserKBPermissionDataOperate}
                  >
                    数据运营
                  </MenuItem>
                </Select>

                <Tooltip
                  title={
                    it.role === 'admin'
                      ? '超级管理员不可被修改权限'
                      : '企业版可用'
                  }
                  placement='top'
                  arrow
                >
                  <InfoIcon
                    sx={{
                      color: 'text.secondary',
                      fontSize: 14,
                      ml: 1,
                      visibility:
                        !isEnterprise || it.role === 'admin'
                          ? 'visible'
                          : 'hidden',
                    }}
                  />
                </Tooltip>
              </Stack>

              <Tooltip
                title={it.role === 'admin' ? '超级管理员不可被删除' : ''}
                placement='top'
                arrow
              >
                <Icon
                  type='icon-icon_tool_close'
                  sx={{
                    cursor: it.role === 'admin' ? 'not-allowed' : 'pointer',
                    color: it.role === 'admin' ? 'text.disabled' : 'error.main',
                  }}
                  onClick={() => {
                    if (it.role === 'admin') return;
                    onDeleteUser(it.id!);
                  }}
                />
              </Tooltip>
            </Stack>
          ))}
        </Box>
      </SettingCardItem>

      <ApiToken />

      <AddRole
        open={addOpen}
        selectedIds={adminList.map(it => it.id!)}
        onCancel={() => setAddOpen(false)}
        onOk={() => {
          getUserList();
          setAddOpen(false);
        }}
      />
    </SettingCard>
  );
};

export default CardKB;
