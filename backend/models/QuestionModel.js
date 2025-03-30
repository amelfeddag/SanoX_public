import supabase from '../config/supabaseClient.js';

// Get first question
export const getFirstQuestion = async () => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

// Get next question based on user choice
export const getNextQuestion = async (choiceId) => {
  const { data, error } = await supabase
    .from('choices')
    .select('next_question_id')
    .eq('id', choiceId)
    .single();

  if (error) throw error;
  if (!data.next_question_id) return null;

  const { data: nextQuestion, error: nextError } = await supabase
    .from('questions')
    .select('*')
    .eq('id', data.next_question_id)
    .single();

  if (nextError) throw nextError;
  return nextQuestion;
};

