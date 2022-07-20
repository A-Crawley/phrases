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
  Dialog,
  Modal,
  useMantineTheme,
  Text,
} from "@mantine/core";
import { useLogger } from "@mantine/hooks";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import "./App.css";
import { GetPhrase } from "./Phrases.js";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

const keyboardLayout = [
  'Q W E R T Y U I O P',
  'A S D F G H J K L ',
  ' Z X C V B N M  '
];

const Save = (phrase, lock, win) => {
  localStorage.setItem("data", JSON.stringify({ phrase, lock, win }));
};

const Load = () => {
  let data = JSON.parse(localStorage.getItem("data"));
  if (data?.phrase?.Text === GetPhrase())
    return data;
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
          (word.length + 1) <= 7
      ) {
        formattedPhrase += ` ${word}`;
        continue;
      }

      formattedPhrase += `\n${word}`;
    }

    phrase = formattedPhrase;
  }

  return (
    <Group position={"left"} spacing={0} sx={{ background:'#1C1D21', padding: '8px 4px 16px 4px', borderRadius: '5px' }}>
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
    <Group 
      sx={{ minHeight: "120px"}} 
      mx={'auto'} 
      mt={'auto'} 
      position={'center'}
      spacing={'xs'}>
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


let keyboard = {};
let keyboardSet = false;
let win = false;
let lock = false;
let set = false;

function App() {

  const theme = useMantineTheme();
  theme.colorScheme = 'dark';

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
          Incorrect: []
        }
      : loadedData.phrase
  );

  const [finalScreen, setFinalScreen] = useState({
    show: false,
    type: ''
  })

  useEffect(() => {
    if (phrase.Incorrect?.length >= 8 && !lock) {
      lock = false;
      setFinalScreen({ show: true, type: 'loss' });
    }
    if (loadedData && !set){
      set = true;
      if (loadedData.win !== win) win = loadedData.win;
      if (loadedData.lock !== lock) lock = loadedData.lock;

      if (win){
        Confetti();
        setFinalScreen({ show: true, type: 'win' })
      } else if (lock) {
        setFinalScreen({ show: true, type: 'loss' })
      }
    }
    if (!keyboardSet){
      phrase.Correct.forEach(l => {
        keyboard.addButtonTheme(l.toUpperCase(), 'correct-letter');
      });
    
      phrase.Incorrect.forEach(l => {
        keyboard.addButtonTheme(l.toUpperCase(), 'incorrect-letter');
      });

      keyboardSet = true;
    }
  }, [phrase, loadedData]);

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
      keyboard.addButtonTheme(letter.toUpperCase(), 'correct-letter');
    } else {
      console.error("oops", letter);
      phrase.Incorrect.push(letter);
      keyboard.addButtonTheme(letter.toUpperCase(), 'incorrect-letter');
    }

    if (phrase.Letters.length === phrase.Correct.length) {
      console.log("YOU WIN!!!");
      lock = true;
      Confetti();
      win = true;
      setFinalScreen({ show: true, type: 'win' })
    }
    setPhrase({ ...phrase });
  }; 

  window.document.onkeydown = (e) => {
    if (!RegExp("^([a-zA-Z]|Backspace|Enter)$").test(e.key)) return;

    onKeyPress(e.key)
  };

  const onKeyPress = (e) => {
    switch (e) {
      case "Backspace":
        break;
      case "Enter":
        break;
      default:
        Guess(e.toLowerCase());
        break;
    }

    Save(phrase, lock, win);
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
                <Title>PHRASES</Title>
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
            <Stack sx={{ height: "90%" }}>
              <Input 
                phrase={phrase.Text} 
                correct={phrase.Correct}
                mt={'auto'}
                />
              <Hangman 
                incorrect={phrase.Incorrect} 
              />
              <Keyboard
                keyboardRef={r => (keyboard = r)} 
                onKeyPress={onKeyPress} 
                theme={'a-keyboard hg-theme-default'} 
                layout={{default: keyboardLayout}} 
                />
            </Stack>
          </Container>
          <Modal 
            opened={finalScreen.show && finalScreen.type === 'win'}
            overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
            overlayOpacity={0.55}
            overlayBlur={3}
            centered
            withCloseButton={false}
            onClose={() => {}}
            >
            <Title order={2}>
              CONGRATULATIONS
            </Title>
            <Title order={3}>
              You have won
            </Title>
            <br/>
            <Text>
              Come back tomorrow for the next <b>PHRASE</b>
            </Text>
          </Modal>
          <Modal 
            opened={finalScreen.show && finalScreen.type === 'loss'}
            overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2]}
            overlayOpacity={0.55}
            overlayBlur={3}
            centered
            withCloseButton={false}
            onClose={() => {}}
            >
            <Title order={2}>
              Thats Unfortunate
            </Title>
            <Title order={3}>
              Looks like you didnt get it...
            </Title>
            <br/>
            <Text>
              The <b>PHRASE</b> was: 
            </Text>
            <Text>
              "<i>{phrase.Text}</i>"
            </Text>
            <br/>
            <Text>
              Come back tomorrow for the next <b>PHRASE</b>
            </Text>
          </Modal>
        </AppShell>
      </MantineProvider>
    </div>
  );
}

export default App;
