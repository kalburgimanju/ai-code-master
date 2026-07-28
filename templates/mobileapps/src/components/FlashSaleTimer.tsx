import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';

interface FlashSaleTimerProps {
  endTime: number;
  compact?: boolean;
  showLabel?: boolean;
  onEnd?: () => void;
}

export const FlashSaleTimer: React.FC<FlashSaleTimerProps> = ({
  endTime,
  compact = false,
  showLabel = true,
  onEnd,
}) => {
  const theme = useAppTheme();
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setEnded(true);
        onEnd?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onEnd]);

  if (compact) {
    return (
      <View style={[
        styles.compactContainer,
        { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }
      ]}>
        {showLabel && (
          <Text style={[styles.compactLabel, { color: theme.colors.primary }]}>
            Ends in
          </Text>
        )}
        <View style={styles.compactTimeRow}>
          {timeLeft.hours > 0 && (
            <>
              <View style={styles.compactTimeUnit}>
                <Text style={[styles.compactTimeValue, { color: theme.colors.primary }]}>
                  {timeLeft.hours.toString().padStart(2, '0')}
                </Text>
                <Text style={[styles.compactTimeUnitLabel, { color: theme.colors.primary }]}>h</Text>
              </View>
              <Text style={[styles.compactSeparator, { color: theme.colors.primary }]}>:</Text>
            </>
          )}
          <View style={styles.compactTimeUnit}>
            <Text style={[styles.compactTimeValue, { color: theme.colors.primary }]}>
              {timeLeft.minutes.toString().padStart(2, '0')}
            </Text>
            <Text style={[styles.compactTimeUnitLabel, { color: theme.colors.primary }]}>m</Text>
          </View>
          <Text style={[styles.compactSeparator, { color: theme.colors.primary }]}>:</Text>
          <View style={styles.compactTimeUnit}>
            <Text style={[styles.compactTimeValue, { color: theme.colors.primary }]}>
              {timeLeft.seconds.toString().padStart(2, '0')}
            </Text>
            <Text style={[styles.compactTimeUnitLabel, { color: theme.colors.primary }]}>s</Text>
          </View>
        </View>
      </View>
    );
  }

  if (ended) {
    return (
      <View style={[styles.endedContainer, { backgroundColor: theme.colors.error + '15', borderColor: theme.colors.error }]}>
        <Ionicons name="time-outline" size={14} color={theme.colors.error} />
        <Text style={[styles.endedText, { color: theme.colors.error }]}>
          Flash Sale Ended
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }
    ]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Ionicons name="flash-outline" size={14} color={theme.colors.primary} />
          <Text style={[styles.label, { color: theme.colors.primary }]}>
            Flash Sale Ends In
          </Text>
        </View>
      )}
      <View style={styles.timeRow}>
        {timeLeft.hours > 0 && (
          <>
            <TimeUnit value={timeLeft.hours} label="hrs" theme={theme} />
            <TimeSeparator theme={theme} />
          </>
        )}
        <TimeUnit value={timeLeft.minutes} label="min" theme={theme} />
        <TimeSeparator theme={theme} />
        <TimeUnit value={timeLeft.seconds} label="sec" theme={theme} />
      </View>
    </View>
  );
};

interface TimeUnitProps {
  value: number;
  label: string;
  theme: ReturnType<typeof useAppTheme>;
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label, theme }) => (
  <View style={styles.timeUnit}>
    <View style={[
      styles.timeBox,
      { backgroundColor: theme.colors.primary, borderColor: theme.colors.primaryDark }
    ]}>
      <Text style={styles.timeValue}>{value.toString().padStart(2, '0')}</Text>
    </View>
    <Text style={[styles.timeLabel, { color: theme.colors.primary }]}>{label}</Text>
  </View>
);

interface TimeSeparatorProps {
  theme: ReturnType<typeof useAppTheme>;
}

const TimeSeparator: React.FC<TimeSeparatorProps> = ({ theme }) => (
  <Text style={[styles.separator, { color: theme.colors.primary }]}>:</Text>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeUnit: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  compactTimeUnit: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
  },
  timeBox: {
    minWidth: 36,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  compactTimeValue: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  compactTimeUnitLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  separator: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 2,
  },
  compactSeparator: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 1,
  },
  endedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  endedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});