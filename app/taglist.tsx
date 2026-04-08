import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TAG_CONFIG: Record<string, { bg: string; text: string }> = {
  '咪咕': { bg: '#FFEBF2', text: '#E6005C' },
  'Hi-Res': { bg: '#FFF3E0', text: '#FF9800' },
  '网易云': { bg: '#FBECEC', text: '#D33030' },
  '独家': { bg: '#E3F2FD', text: '#2196F3' },
  'default': { bg: '#F5F5F5', text: '#9E9E9E' },
};

interface TagListProps {
  tags: string[] | undefined
}

const TagList: React.FC<TagListProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <View style={styles.tagContainer}>
      {tags.map((tagName) => {
        const config = TAG_CONFIG[tagName] || TAG_CONFIG['default'];
        return (
          <View key={tagName} style={[styles.tag, { backgroundColor: config.bg }]}>
            <Text style={[styles.tagText, { color: config.text }]}>{tagName}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TagList;
