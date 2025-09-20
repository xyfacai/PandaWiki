import { Box, Popover, Stack, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

interface Item {
  label: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  selected?: boolean;
  children?: Item[];
  show?: boolean;
  textSx?: SxProps<Theme>;
  key: number | string;
  onClick?: () => void;
}

interface MenuSelectProps {
  id?: string;
  arrowIcon?: React.ReactNode;
  list: Item[];
  context?: React.ReactElement<{ onClick?: any; 'aria-describedby'?: any }>;
  anchorOrigin?: {
    vertical: 'top' | 'bottom' | 'center';
    horizontal: 'left' | 'right' | 'center';
  };
  transformOrigin?: {
    vertical: 'top' | 'bottom' | 'center';
    horizontal: 'left' | 'right' | 'center';
  };
  childrenProps?: {
    anchorOrigin?: {
      vertical: 'top' | 'bottom' | 'center';
      horizontal: 'left' | 'right' | 'center';
    };
    transformOrigin?: {
      vertical: 'top' | 'bottom' | 'center';
      horizontal: 'left' | 'right' | 'center';
    };
  };
}

const MenuSelect: React.FC<MenuSelectProps> = ({
  id = 'menu-select',
  arrowIcon,
  list,
  context,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'right',
  },
  childrenProps = {
    anchorOrigin: {
      vertical: 'top',
      horizontal: 'right',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
  },
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const [hoveredItem, setHoveredItem] = React.useState<Item | null>(null);
  const [subMenuAnchor, setSubMenuAnchor] = React.useState<HTMLElement | null>(
    null,
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setHoveredItem(null);
    setSubMenuAnchor(null);
  };

  const handleItemHover = (
    event: React.MouseEvent<HTMLElement>,
    item: Item,
  ) => {
    if (item.children?.length) {
      setHoveredItem(item);
      setSubMenuAnchor(event.currentTarget);
    }
  };

  const handleItemLeave = () => {
    setHoveredItem(null);
    setSubMenuAnchor(null);
  };

  const handleItemClick = (item: Item) => {
    if (item.onClick) {
      item.onClick();
    }
    handleClose();
  };

  const open = Boolean(anchorEl);
  const curId = open ? id : undefined;
  return (
    <>
      {context &&
        React.cloneElement(context, {
          onClick: handleClick,
          'aria-describedby': curId,
        })}
      <Popover
        id={curId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <Box className='menu-select-list' sx={{ p: 0.5 }}>
          {list.map(item =>
            item.show === false ? null : (
              <Box
                className='menu-select-item'
                key={item.key}
                onMouseEnter={e => handleItemHover(e, item)}
                onMouseLeave={handleItemLeave}
                onClick={() => handleItemClick(item)}
                sx={{
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <Stack alignItems='center' gap={1} direction='row'>
                  {item.icon}
                  <Typography
                    variant='body1'
                    sx={{ flexShrink: 0, ...item.textSx }}
                  >
                    {item.label}
                  </Typography>
                  {item.extra}
                  {item.children?.length ? arrowIcon : null}
                </Stack>
                {hoveredItem === item && item.children && (
                  <Popover
                    open={Boolean(subMenuAnchor)}
                    anchorEl={subMenuAnchor}
                    onClose={handleItemLeave}
                    sx={{ pointerEvents: 'none' }}
                    {...childrenProps}
                  >
                    <Box
                      className='menu-select-sub-list'
                      sx={{
                        pointerEvents: 'auto',
                        p: 0.5,
                      }}
                    >
                      {item.children.map(child =>
                        child.show === false ? null : (
                          <Box
                            key={child.key}
                            className='menu-select-sub-item'
                            onClick={() => handleItemClick(child)}
                            sx={{
                              cursor: 'pointer',
                            }}
                          >
                            <Stack alignItems='center' gap={1} direction='row'>
                              {child.icon}
                              <Typography
                                sx={{ flexShrink: 0, ...child.textSx }}
                              >
                                {child.label}
                              </Typography>
                              {child.extra}
                            </Stack>
                          </Box>
                        ),
                      )}
                    </Box>
                  </Popover>
                )}
              </Box>
            ),
          )}
        </Box>
      </Popover>
    </>
  );
};

export default MenuSelect;
