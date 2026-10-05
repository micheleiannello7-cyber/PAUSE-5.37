import { View, Text, ScrollView, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@react-native-vector-icons/ionicons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { api, CollectionGroup } from "@/src/api";
import { makeStyles, useTheme, spacing, radius, typography, withAlpha } from "@/src/theme";
import { useUserId } from "@/src/session";
import { useI18n } from "@/src/i18n";
import { HomeButton } from "@/src/components/home-button";
import { Screen } from "@/src/components/screen";
import { CategoryArtMark } from "@/src/components/category-artwork";
import { CollectionCard, LockedCard, CARD_W } from "@/src/components/collection-card";

type Item = { kind: "story"; index: number } | { kind: "locked"; id: string };

export default function CollectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useUserId();
  const { t } = useI18n();
  const styles = useStyles();
  const { colors } = useTheme();

  const q = useQuery({
    queryKey: ["collection", userId],
    queryFn: () => api.collection(userId!),
    enabled: !!userId,
  });
  const data = q.data;
  const ratio = data && data.total > 0 ? data.unlocked / data.total : 0;

  return (
    <Screen style={[styles.container, { paddingTop: insets.top }]} testID="collection-screen">
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} testID="collection-back" hitSlop={8} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={styles.title} numberOfLines={1}>{t.collection_title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{t.collection_sub}</Text>
        </View>
        <HomeButton testID="collection-home" />
      </View>

      {q.isLoading || !data ? (
        <View style={styles.loading}><ActivityIndicator color={colors.brand} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={q.refetch} tintColor={colors.brand} />}
        >
          <View style={styles.summary} testID="collection-summary">
            <LinearGradient pointerEvents="none" colors={[withAlpha(colors.brand, 0.14), withAlpha(colors.surfaceDeep, 0.1)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summaryBg} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCount} testID="collection-count">{data.unlocked}</Text>
              <Text style={styles.summaryTotal}>/ {data.total}</Text>
            </View>
            <Text style={styles.summaryLabel}>{t.collection_progress.replace("{n}", String(data.unlocked)).replace("{total}", String(data.total))}</Text>
            <View style={styles.track}>
              <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${Math.max(2, ratio * 100)}%` }]} />
            </View>
            {data.unlocked === 0 ? <Text style={styles.empty} testID="collection-empty">{t.collection_empty}</Text> : null}
          </View>

          {data.categories.map((g, i) => (
            <Animated.View key={g.id} entering={FadeInDown.delay(Math.min(i, 6) * 60).duration(360)}>
              <Group group={g} onOpen={(id) => router.push(`/deep-dive/${id}`)} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function Group({ group, onOpen }: { group: CollectionGroup; onOpen: (id: string) => void }) {
  const styles = useStyles();
  const items: Item[] = [
    ...group.stories.map((_, index) => ({ kind: "story" as const, index })),
    ...group.locked_ids.map((id) => ({ kind: "locked" as const, id })),
  ];
  const ratio = group.total > 0 ? group.unlocked / group.total : 0;
  return (
    <View style={styles.group} testID={`collection-group-${group.id}`}>
      <View style={styles.groupHead}>
        <CategoryArtMark categoryId={group.id} color={group.color} size={28} aspect={1.2} plain tight testID={`collection-group-icon-${group.id}`} />
        <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
        <Text style={[styles.groupCount, { color: group.color }]} testID={`collection-group-count-${group.id}`}>{group.unlocked}/{group.total}</Text>
      </View>
      <View style={styles.groupTrack}>
        <View style={[styles.groupFill, { width: `${ratio * 100}%`, backgroundColor: group.color }]} />
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(it) => (it.kind === "story" ? group.stories[it.index].id : it.id)}
        renderItem={({ item }) =>
          item.kind === "story" ? (
            <CollectionCard
              story={group.stories[item.index]}
              onPress={() => onOpen(group.stories[item.index].id)}
              testID={`collection-card-${group.stories[item.index].id}`}
            />
          ) : (
            <LockedCard color={group.color} testID={`collection-locked-${item.id}`} />
          )
        }
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cards}
        initialNumToRender={5}
        windowSize={5}
        getItemLayout={(_, index) => ({ length: CARD_W + spacing.sm, offset: (CARD_W + spacing.sm) * index, index })}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border,
  },
  headerTitle: { flex: 1, alignItems: "center", gap: 3 },
  title: { color: colors.onSurface, fontFamily: typography.displayBold, fontSize: 16, textAlign: "center" },
  subtitle: { color: colors.muted, fontFamily: typography.body, fontSize: 11, textAlign: "center", lineHeight: 15 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  summary: {
    marginHorizontal: spacing.xl, marginTop: spacing.sm, padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, borderColor: withAlpha(colors.brand, 0.3), overflow: "hidden", gap: spacing.xs,
  },
  summaryBg: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  summaryRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  summaryCount: { color: colors.textWarm, fontFamily: typography.displayHero, fontSize: 40, lineHeight: 46 },
  summaryTotal: { color: colors.muted, fontFamily: typography.bodyBold, fontSize: 16 },
  summaryLabel: { color: colors.onSurfaceTertiary, fontFamily: typography.body, fontSize: 13, lineHeight: 18 },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.glassBg, overflow: "hidden", marginTop: spacing.sm },
  fill: { height: 6, borderRadius: 3 },
  empty: { color: colors.muted, fontFamily: typography.body, fontSize: 13, lineHeight: 19, marginTop: spacing.sm },
  group: { marginTop: spacing.xl },
  groupHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.xl },
  groupName: { flex: 1, color: colors.onSurface, fontFamily: typography.displayBold, fontSize: 17 },
  groupCount: { fontFamily: typography.bodyBold, fontSize: 13 },
  groupTrack: { height: 2, borderRadius: 1, backgroundColor: colors.glassBorder, marginHorizontal: spacing.xl, marginTop: spacing.sm, overflow: "hidden" },
  groupFill: { height: 2, borderRadius: 1 },
  cards: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, gap: spacing.sm },
}));
