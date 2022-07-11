import {
  Button,
  AppShell,
  Navbar,
  Header,
  MantineProvider,
  Container,
  Stack,
  Title,
  Group,
} from "@mantine/core";
import { useLogger } from "@mantine/hooks";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import "./App.css";
import { GetPhrase } from "./Phrases.js";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const keyboardLayout = [
  'q w e r t y u i o p',
  'a s d f g h j k l ',
  ' z x c v b n m  '
]

const Save = (phrase, lock) => {
  localStorage.setItem("data", JSON.stringify({ phrase, lock }));
};

const Load = () => {
  return JSON.parse(localStorage.getItem("data"));
};

/**
 *
 * @param {string} phrase
 * @param {string} guess
 */
const Input = ({ phrase, correct }) => {
  if (!phrase || !correct) return;

  const NumberOfLetters = () => phrase.length;
  const LetterArray = () => [...phrase];

  if (NumberOfLetters() > 7) {
    let words = phrase.split(" ");
    let formattedPhrase = "";

    for (let word of words) {
      if (formattedPhrase.length === 0) {
        formattedPhrase = word;
        continue;
      }

      if (
        formattedPhrase.substring(formattedPhrase.lastIndexOf("\n") + 1)
          .length === 0
      ) {
        formattedPhrase += `${word}`;
        continue;
      }

      if (
        formattedPhrase.substring(formattedPhrase.lastIndexOf("\n") + 1)
          .length +
          (word.length + 1) <=
        8
      ) {
        formattedPhrase += ` ${word}`;
        continue;
      }

      formattedPhrase += `\n${word}`;
    }

    phrase = formattedPhrase;
  }

  return (
    <Group position={"left"} spacing={0} mt={'auto'}>
      {LetterArray().map((el, i) => {
        let classes = "letterBox";

        if (el === " ") classes = "letterBox space";
        if (el === "\n") classes = "break";

        return (
          <div key={i} className={classes}>
            <p>{correct.includes(el) ? phrase[i] : ""}</p>
          </div>
        );
      })}
    </Group>
  );
};

const Hangman = ({ incorrect }) => {
  if (!incorrect) return;

  return (
    <Group sx={{ minHeight: "100px" }} mx={'auto'} >
        {incorrect.map((el, i) => {
          return (
            <div key={i} className={"incorrect"}>
              {el}
            </div>
          );
        })}
    </Group>
  );
};

const Confetti = () => {
  var duration = 15 * 1000;
  var animationEnd = Date.now() + duration;
  var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  var interval = setInterval(function () {
    var timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
};

function App() {
  const GetLetters = () => {
    const phrase = GetPhrase().replaceAll(" ", "");
    return [...new Set([...phrase])];
  };
  const loadedData = Load();

  const [phrase, setPhrase] = useState(
    !loadedData
      ? {
          Text: GetPhrase(),
          Letters: GetLetters(),
          Correct: [],
          Incorrect: [],
        }
      : loadedData.phrase
  );

  const [lock, setLock] = useState(!loadedData ? false : loadedData.lock);

  useEffect(() => {
    if (phrase.Incorrect?.length >= 6 && !lock) setLock(true);
  }, [phrase, lock]);

  const Guess = (letter) => {
    if (phrase.Correct.includes(letter) || phrase.Incorrect.includes(letter))
      return;
    if (lock) {
      console.log("No more");
      return;
    }

    if (phrase.Letters.includes(letter)) {
      console.log("You got it", letter);
      phrase.Correct.push(letter);
    } else {
      console.error("oops", letter);
      phrase.Incorrect.push(letter);
    }

    if (phrase.Letters.length === phrase.Correct.length) {
      console.log("YOU WIN!!!");
      setLock(true);
      Confetti();
    }
    setPhrase({ ...phrase });
  };

  window.document.onkeydown = (e) => {
    if (!RegExp("^([a-zA-Z]|Backspace|Enter)$").test(e.key)) return;

    switch (e.key) {
      case "Backspace":
        break;
      case "Enter":
        break;
      default:
        Guess(e.key.toLowerCase());
        break;
    }

    Save(phrase, lock);
  };

  const onKeyPress = (button) => {
    console.log("Button pressed", button);
  };

  return (
    <div className="App">
      <MantineProvider
        theme={{ colorScheme: "dark" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <AppShell
          padding={0}
          header={
            <Header height={60} p="xs" sx={{ position: "sticky" }}>
              <Stack dir="row">
                <Title>HANGMAN</Title>
              </Stack>
            </Header>
          }
          styles={(theme) => ({
            main: {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
        >
          <Container
            sx={{
              height: "calc(100vh - 60px)",
              padding: "16px",
            }}
          >
            <Stack justify="space-between" sx={{ height: "100%" }}>
              <Hangman incorrect={phrase.Incorrect} />
              <Input phrase={phrase.Text} correct={phrase.Correct}/>
              <Keyboard onKeyPress={onKeyPress} layout={{default: keyboardLayout}} theme={'a-keyboard hg-theme-default'} />
            </Stack>
          </Container>
        </AppShell>
      </MantineProvider>
    </div>
  );
}

export default App;
