import React from 'react'
import { View, Dimensions, Animated, StyleSheet, Text, type NativeScrollEvent, type NativeSyntheticEvent, type ViewStyle, type FlatListProps, Button } from 'react-native'
import { useAuthHook } from '../useAuthHooks';
import { SvgXml } from 'react-native-svg';
import DATA, { type iAssets } from '../data'
import * as IconsComp from '../assets'
import type { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

export const ICON_SIZE = 42;
export const ITEM_HEIGHT = ICON_SIZE * 2;
export const { width, height } = Dimensions.get('window');

type iColor = 'black' | 'white'
type iSize = number
type iRefColor = AnimatedProps<FlatListProps<iAssets>>
type iStyle = Animated.WithAnimatedObject<ViewStyle>

const Icon = React.memo(({ icon, color, size }: { color: iColor, icon: iAssets, size?: iSize }) => {
    if (!size) {
        size = 50
    }
    return <SvgXml height={size} width={size} xml={IconsComp[icon](color, color === 'black' ? 'white' : 'black')} />;
});

const Item = React.memo(({ color, name, showText }: { name: iAssets, showText: boolean, color: iColor }) => {
    return (
        <View style={styles.itemWrapper}>
            {showText ? (
                <Text
                    style={[styles.itemText, { color }]}
                >
                    {name}
                </Text>
            ) : (
                <View />
            )}
            <Icon icon={name} color={color} />
        </View>
    );
});

export const List = React.memo(
    React.forwardRef(
        ({ color, showText, style, onScroll, onItemIndexChange }: {
            color: iColor,
            showText: boolean,
            style: Animated.WithAnimatedObject<ViewStyle>,
            onScroll: ((event: NativeSyntheticEvent<NativeScrollEvent>) => void) | undefined,
            onItemIndexChange: (e: number) => void
        }, ref: iRefColor
        ) => {

            return (
                <Animated.FlatList
                    ref={ref}
                    data={DATA}
                    style={style}
                    keyExtractor={(item) => item}
                    bounces={false}
                    scrollEnabled={!showText}
                    scrollEventThrottle={16}
                    onScroll={onScroll}
                    decelerationRate='fast'
                    snapToInterval={ITEM_HEIGHT}
                    showsVerticalScrollIndicator={false}
                    renderToHardwareTextureAndroid
                    contentContainerStyle={{
                        paddingTop: showText ? 0 : height / 2 - ITEM_HEIGHT / 2,
                        paddingBottom: showText ? 0 : height / 2 - ITEM_HEIGHT / 2,
                        paddingHorizontal: 20,
                    }}
                    renderItem={({ item }) => {
                        return <Item name={item} color={color} showText={showText} />;
                    }}
                    onMomentumScrollEnd={(ev) => {
                        const newIndex = Math.round(
                            ev.nativeEvent.contentOffset.y / ITEM_HEIGHT
                        );

                        if (onItemIndexChange) {
                            onItemIndexChange(newIndex);
                        }
                    }} />
            );
        }
    )
);



export default () => {
    const {
        currentIndex: [index, setIndex],
        onConnectPress,
        modal: [openModal, setOpenModal],
        github: [signInWithGithub, signOut],
        link: [link, onNavigationStateChange, setLink],
    } = useAuthHook();

    const yellowRef = React.useRef<iRefColor>();
    const darkRef = React.useRef<iRefColor>();
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
    );
    const onItemIndexChange = React.useCallback((e: number) => setIndex(e), []);

    React.useEffect(() => {
        scrollY.addListener(v => {
            if (darkRef?.current) {
                darkRef.current.scrollToOffset({
                    offset: v.value,
                    animated: false,
                });
            }
        });
    });


    return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]}>
            <List
                ref={yellowRef}
                color={'white'}
                style={StyleSheet.absoluteFillObject as iStyle}
                onScroll={onScroll}
                onItemIndexChange={onItemIndexChange}
            />
            <List
                ref={darkRef}
                color={'black'}
                showText
                style={[
                    {
                        backgroundColor: 'white',
                        height: ITEM_HEIGHT,
                        top: height / 2 - ITEM_HEIGHT / 2,
                        width,
                    },
                    styles.containerBlock,
                ] as iStyle}
            />
            <View style={{bottom:0,left:0,right:0,top:300}}>
            <Button title='Slava' onPress={signInWithGithub} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerBlock: {
        position: 'absolute',
        borderBottomLeftRadius: 0,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    itemWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: ITEM_HEIGHT,
    },
    itemText: {
        fontSize: 26,
        fontWeight: '800',
        textTransform: 'capitalize',
    },
});