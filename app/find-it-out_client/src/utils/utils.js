import { Box, CircularProgress, Typography } from "@material-ui/core"
import { useLocation } from "react-router"
import { NUM_TASKS } from "../constants/AppConstants"

export const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const removeUnderscore = word => {
  return capitalize(word.replaceAll('_', ' '))
}

export const withTimeout = (onSuccess, onTimeout, timeout) => {
  let called = false;

  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);

  return (...args) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  }
}

export const simplifyBoard = (cards) => {
  return cards.map(card => { return { 'id': card['id'], 'is_flipped': card['is_flipped'] } })
}


export const ConditionalWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;


export const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

export const openInNewTab = (url) => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

export const clamp = function (num, min, max) {
  return Math.min(Math.max(num, min), max)
}

export const randomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

export const reduceCards = (cards) => {
  return cards.reduce((total, card) => { return (total << 1) | (card['is_flipped']) }, 0)
}

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const getProgressCompletion = (progress) => {
  return {
    'EASY': clamp(progress['EASY'], 0, 3),
    'MEDIUM': clamp(progress['MEDIUM'], 0, 2),
    // 'HARD': clamp(progress['HARD'], 0, 0)
  }
}

const isObjectEmpty = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object
}

export const getRemainingTasks = (progress) => {
  if (isObjectEmpty(progress)) {
    return [-1, {}]
  }
  const taskCompletion = getProgressCompletion(progress)
  return [NUM_TASKS - Object.values(taskCompletion).reduce((a, b) => a + b), taskCompletion]
}

export function CircularProgressWithLabel({ value, ...props }) {
  // return value === 100 ? <CheckCircle color="secondary" /> :
  return (<Box position="relative" display="inline-flex" {...props}>
    <div>
      <CircularProgress variant="determinate" value={value} size="4em" />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="subtitle1" component="div" color="textSecondary">{`${Math.round(value)}%`}</Typography>
      </Box>
    </div>
  </Box>)
}