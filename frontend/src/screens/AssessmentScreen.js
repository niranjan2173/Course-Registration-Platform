import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import registrationService from '../services/registrationService';
import { getAssessmentQuestions } from '../data/assessmentBank';
import theme from '../theme';
import { AppButton, AppCard, useToast } from '../components';

export default function AssessmentScreen({ navigation, route }) {
  const { showToast } = useToast();
  const { courseId, courseName, milestone, courseCategory } = route.params || {};

  const questions = useMemo(
    () => getAssessmentQuestions({ courseCategory }),
    [courseCategory]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const setAnswer = index => {
    setAnswers(prev => ({ ...prev, [current.id]: index }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    const percent = Math.round((correct / questions.length) * 100);
    return { correct, percent };
  };

  const handleSubmit = async () => {
    if (answeredCount < questions.length) {
      Alert.alert('Complete All Questions', 'Please answer all questions before submitting.');
      return;
    }

    const { correct, percent } = calculateScore();
    setSubmitting(true);

    try {
      const result = await registrationService.submitAssessment(courseId, milestone, percent);
      setResult({
        passed: result.passed,
        score: result.score,
        progress: result.progress,
        correctCount: correct,
      });
    } catch (error) {
      showToast(error?.message || 'Unable to submit assessment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
            <Ionicons name="chevron-back" size={26} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>{courseName || 'Assessment'}</Text>
            <Text style={styles.headerSubtitle}>Result</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{result.score}%</Text>
          </View>
        </View>

        <AppCard style={styles.resultCard}>
          <Ionicons
            name={result.passed ? 'trophy' : 'alert-circle'}
            size={40}
            color={result.passed ? theme.colors.primaryPink : theme.colors.primaryPurple}
          />
          <Text style={styles.resultTitle}>{result.passed ? 'Assessment Passed' : 'Assessment Failed'}</Text>
          <Text style={styles.resultSubtitle}>
            Correct Answers: {result.correctCount} / {questions.length}
          </Text>
          <Text style={styles.resultSubtitle}>
            Score: {result.score}% out of 100%
          </Text>
          <Text style={styles.resultSubtitle}>
            {result.passed
              ? `Great job! Your progress is now ${result.progress}%.`
              : `Score below 75%. Progress reset to ${result.progress}%.`}
          </Text>
        </AppCard>

        <View style={styles.navRow}>
          <AppButton
            title="Back to Progress"
            onPress={() => navigation.goBack()}
            style={styles.navButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={26} color={theme.colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{courseName || 'Assessment'}</Text>
          <Text style={styles.headerSubtitle}>{milestone}% Milestone Exam</Text>
        </View>
        <Text style={styles.progressText}>{answeredCount}/{questions.length}</Text>
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.questionLabel}>Question {currentIndex + 1}</Text>
        <Text style={styles.questionText}>{current.question}</Text>

        <View style={styles.optionsWrap}>
          {current.options.map((option, index) => {
            const selected = answers[current.id] === index;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.optionRow, selected && styles.optionRowSelected]}
                onPress={() => setAnswer(index)}
                accessibilityRole="button"
                accessibilityLabel={`Answer ${index + 1}`}
              >
                <View style={[styles.optionBullet, selected && styles.optionBulletSelected]}>
                  {selected ? <Ionicons name="checkmark" size={14} color={theme.colors.white} /> : null}
                </View>
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppCard>

      <View style={styles.navRow}>
        <AppButton
          title="Previous"
          variant="secondary"
          onPress={goPrev}
          disabled={currentIndex === 0 || submitting}
          style={styles.navButton}
        />
        <AppButton
          title={currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
          onPress={currentIndex === questions.length - 1 ? handleSubmit : goNext}
          disabled={submitting}
          loading={submitting}
          style={styles.navButton}
        />
      </View>

      <FlatList
        data={questions}
        keyExtractor={item => item.id}
        numColumns={10}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const answered = answers[item.id] !== undefined;
          return (
            <TouchableOpacity
              style={[styles.gridItem, answered && styles.gridItemDone]}
              onPress={() => setCurrentIndex(index)}
              accessibilityRole="button"
            >
              <Text style={[styles.gridText, answered && styles.gridTextDone]}>{index + 1}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: theme.spacing.md },
  header: {
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextWrap: { flex: 1, marginLeft: theme.spacing.sm },
  headerTitle: { color: theme.colors.white, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold },
  headerSubtitle: { color: theme.colors.white + 'AA', marginTop: 2 },
  progressText: { color: theme.colors.white, fontWeight: theme.typography.weights.semibold },
  progressBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: '#111827',
  },
  card: { margin: theme.spacing.md, backgroundColor: '#111827' },
  questionLabel: { color: theme.colors.primaryPink, fontWeight: theme.typography.weights.semibold },
  questionText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  optionsWrap: { gap: theme.spacing.sm },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#1F2937',
    backgroundColor: '#0B1220',
  },
  optionRowSelected: { borderColor: theme.colors.primaryPink, backgroundColor: '#1E1B4B' },
  optionBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: theme.colors.white + '66',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  optionBulletSelected: { backgroundColor: theme.colors.primaryPink, borderColor: theme.colors.primaryPink },
  optionText: { color: theme.colors.white, flex: 1 },
  optionTextSelected: { color: theme.colors.white, fontWeight: theme.typography.weights.semibold },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md },
  navButton: { flex: 1, marginHorizontal: theme.spacing.xs },
  grid: { padding: theme.spacing.md },
  gridItem: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.white + '33',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  gridItemDone: { backgroundColor: theme.colors.primaryPink, borderColor: theme.colors.primaryPink },
  gridText: { color: theme.colors.white + 'AA', fontSize: theme.typography.sizes.xs },
  gridTextDone: { color: theme.colors.white, fontWeight: theme.typography.weights.bold },
  resultCard: {
    margin: theme.spacing.md,
    backgroundColor: '#111827',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  resultTitle: { color: theme.colors.white, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold },
  resultSubtitle: { color: theme.colors.white + 'AA', textAlign: 'center' },
});
