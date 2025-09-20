'use client';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Box, IconButton, Popover, SxProps } from '@mui/material';
import React, { useCallback } from 'react';
import zh from './emoji-data/zh.json';
import {
  IconWenjianjia,
  IconWenjianjiaKai,
  IconWenjian,
} from '@panda-wiki/icons';

interface EmojiPickerProps {
  type: 1 | 2;
  readOnly?: boolean;
  value?: string;
  collapsed?: boolean;
  onChange?: (emoji: string) => void;
  sx?: SxProps;
  iconSx?: SxProps;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  type,
  readOnly,
  value,
  onChange,
  collapsed,
  sx,
  iconSx,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (readOnly) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = useCallback(
    (emoji: any) => {
      onChange?.(emoji.native);
      handleClose();
    },
    [onChange],
  );

  const open = Boolean(anchorEl);
  const id = open ? 'emoji-picker' : undefined;

  return (
    <>
      <IconButton
        size='small'
        aria-describedby={id}
        disabled={readOnly}
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          height: 28,
          color: 'text.primary',
          ...sx,
        }}
      >
        {value ? (
          <Box component='span' sx={{ fontSize: 14, ...iconSx }}>
            {value}
          </Box>
        ) : (
          <>
            {type === 1 ? (
              collapsed ? (
                <IconWenjianjia sx={{ fontSize: 16, ...iconSx }} />
              ) : (
                <IconWenjianjiaKai sx={{ fontSize: 16, ...iconSx }} />
              )
            ) : (
              <IconWenjian sx={{ fontSize: 16, ...iconSx }} />
            )}
          </>
        )}
      </IconButton>
      <Popover
        id={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Picker
          data={data}
          set='native'
          theme='light'
          locale='zh'
          i18n={zh}
          onEmojiSelect={handleSelect}
          previewPosition='none'
          searchPosition='sticky'
          skinTonePosition='none'
          perLine={9}
          emojiSize={24}
        />
      </Popover>
    </>
  );
};

export default EmojiPicker;
