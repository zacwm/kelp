import React, { useState, useRef, useMemo } from "react";
import { VirtuosoGrid, GridComponents, GridItemContent } from "react-virtuoso";
import { Box, Loader, createStyles, LoadingOverlay } from "@mantine/core";

import MemoizedTorrent from "./TorrentCell";

interface Props {
    itemData: object[];
    isLoading: boolean;
    setSelectedTitle: React.Dispatch<React.SetStateAction<any>>;
    fetchTorrentList: (page: number, concat: boolean, forceLoad: boolean, callback?: Function) => void;
}

const useStyles = createStyles((theme) => ({
    list: {
        display: "flex",
        flexWrap: "wrap",
    },
    itemContainer: {
        width: "20%",
        display: "flex",
        flex: "none",
        padding: "10px",
        alignContent: "stretch",
        boxSizing: "border-box",
        // [`@media (max-width: ${theme.breakpoints.lg}px)`]: {
        //     width: "33%"
        // },
        // [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
        //     width: "50%"
        // }
    },
}));

const VirtualList = ({
    itemData,
    isLoading,
    setSelectedTitle,
    fetchTorrentList
}: Props): React.ReactElement => {
    const { classes } = useStyles();

    const [shallowFetch, setShallowFetch] = useState(false);

    const hasMoreData = () => {
        return itemData.length >= 50;
    }

    const lastPage = useRef(1);
    const hasMore = hasMoreData();

    const onEndReached = () => {
        if (shallowFetch || !hasMore) {
            return;
        };

        setShallowFetch(true);
        lastPage.current += 1;
        fetchTorrentList(lastPage.current, true, false, () => {
            setShallowFetch(false);
        });
    }

    const itemContent: GridItemContent<number> = (index: number) => {
        const torrent = itemData[index];

        if (torrent) {
            return (
                <MemoizedTorrent 
                    key={index}
                    title={torrent}
                    onSelect={() => setSelectedTitle(torrent)}
                    delayIndex={index}
                />
            )
        } else {
            return <div style={{ height: 1 }}/>
        }        
    }

    const Components: GridComponents = useMemo(() => {
        const List = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>((props, ref) => (
            <div {...props} ref={ref} className={classes.list}/>
        ))

        const ItemContainer = (props: any) => {
            return <div {...props} className={classes.itemContainer}/>
        }

        return {
            List: List,
            Item: ItemContainer
        }
    }, [itemData, isLoading])

    if (isLoading) {
        return (
            <Box sx={{
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <Loader />
            </Box>
        )
    }

    return (
        <div style={{
            height: "100%",
            width: "100%",
            padding: 32
        }}>
            <LoadingOverlay visible={shallowFetch} />
            <VirtuosoGrid
                style={{ height: "100%" }}
                totalCount={itemData.length}
                overscan={150}
                components={Components}
                itemContent={itemContent}
                endReached={onEndReached}
            />
        </div>
    )
}

const MemoizedVirtualList = React.memo(VirtualList, (prevProps: Props, nextProps: Props) => {
    return JSON.stringify(prevProps.itemData) === JSON.stringify(nextProps.itemData) && prevProps.isLoading === nextProps.isLoading;
});

export default MemoizedVirtualList;
