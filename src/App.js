import { experimentalStyled as styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Web3 from "web3";
import { useState } from 'react';
import registryAbi from "./abis/Registry.json";
import propertyAbi from "./abis/Property.json";
import env from "react-dotenv";


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

let ppt, registry;

function App() {

  const [courses, setCourses] = useState([{
      title: "Java Masterclass",
      description: "Learn Java from scratch",
      surity: 17,
      issuer: "",
      issuer_name: "Tim Buchaka",
    },
    {
      title: "Data Structures & Algorithms",
      description: "Learn Data Structures & Algorithms",
      surity: 21,
      issuer: "",
      issuer_name: "Tamara Kostova",
    },
    {
      title: "Blockchain",
      description: "Learn Blockchain",
      surity: 0,
      issuer: "",
      issuer_name: "BUET",
    }
  ]);

  const [myCourses, setMyCourse] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);

  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");
  const [properties, setProperties] = useState(null);
  const [purchases, setPurchases] = useState(null);

  const [page, setPage] = useState("courses");

  const loadWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      // Connect to metamask
      const web3 = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
      }
      catch (error) {
        console.log(error);
      }

      const accounts = await web3.eth.getAccounts();
      
      if (typeof accounts[0] !== "undefined") {
        const balance = await web3.eth.getBalance(accounts[0]);
        setAccount(accounts[0]);
        setBalance(balance);
      } 
      else {
        console.log("Please login with metamask")
      }

      try {
        // Access smart contracts
        ppt = new web3.eth.Contract(propertyAbi, "0xCd29c1330a09332fe26d43cd30823aca217598A8" /*env.PROPERTY_CONTRACT_ADDRESS*/);
        registry = new web3.eth.Contract(registryAbi, "0xABCF51237EB987e2bF218B8Fdf044fD336cE1f3a" /*env.REGISTRY_CONTRACT_ADDRESS*/);

        getInitialData();
      }
      catch (e) {
        console.log("Error loading smart contract: " + e);
      }
    }
    else {
      window.alert("Please install metamask")
    }
  };

  const getInitialData = async () => {
    // Get list of properties & purchases
    let props = await registry.methods.getProperties().call();
    setPurchases(await registry.methods.getPurchases().call());

    // Collect all ownership information from NFT contract
    setProperties(await Promise.all(props.map(async (item, index) => ({
      ...item,
      id: index,
      owner: await ppt.methods.ownerOf(index).call()
    }))));
  }

  const buyProperty = async (pid, price) => {
    await registry.methods.buyProperty(pid)
      .send({ from: account, value: price, gas: 1e6 })
      .then(console.log);
  };

  const setPropertyAvailability = async (pid, avl) => {
    await registry.methods.setPropertyAvailability(pid, avl)
      .send({ from: account, gas: 1e6 })
      .then(console.log);
  };

  const buyCourse = async (course) => {
    setCourses(courses.filter(item => item.title !== course.title || item.issuer !== course.issuer));
    setMyCourse([...myCourses, course]);
    // TODO : Pay Surity for the course
  }

  const finishCourse = async (course) => {

  }

  const deadlineReached = async (course) => {

  }

  const extendDeadline = async (course) => {

  }

  loadWeb3();

  let content = null;

  if (page === "courses") {
    content = (
      <>
      <Typography variant="h4" gutterBottom component="div" sx={{mb: 4}}>
        Available Courses
      </Typography>
      <Container maxWidth="lg" sx={{mb: 4}}>
        <Grid container spacing={3}>
          {courses.map((course, index) => (
            <Grid item xs={6}>
              <Item>
                <Typography variant="h5">{course.title}</Typography>
                <Typography variant="body1">{course.description}</Typography>
                <Typography variant="body1">Surity: {course.surity || 'None'}</Typography>
                <Typography variant="body1" sx={{mb: 2}}>Course By: {course.issuer_name}</Typography>

                <Button variant="contained" color="primary" onClick={() => buyCourse(course)}>Buy</Button>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Typography variant="h4" gutterBottom component="div" sx={{mb: 4}}>
        My Courses
      </Typography>

      <Container maxWidth="lg" sx={{mb: 4}}>
        <Grid container spacing={3}>
          {myCourses.map((course, index) => (
            <Grid item xs={6}>
              <Item>
                <Typography variant="h5">{course.title}</Typography>
                <Typography variant="body1">{course.description}</Typography>
                <Typography variant="body1">Surity: {course.surity || 'None'}</Typography>
                <Typography variant="body1" sx={{mb: 2}}>Course By: {course.issuer_name}</Typography>

                <Button variant="contained" color="success" size='small' onClick={() => finishCourse(course)}>Finish within deadline</Button>
                <Button variant="outlined" color="error" size='small' onClick={() => deadlineReached(course)}>Deadline Over</Button>
                <Button variant="outlined" color="warning" size='small' onClick={() => extendDeadline(course)}>Extend Deadline</Button>
              </Item>
            </Grid>
          ))}
        </Grid>
      </Container>
      </>
    );
  } else if (page === 'certificates') {
    content = <>
      <Typography variant="h4" gutterBottom component="div" sx={{mb: 4}}>
        My Certificates
      </Typography>
    </>
  }

  return (
    <div className="App">
      <Box sx={{ flexGrow: 1 }}>

        <AppBar position="static" style={{ marginBottom: "20px" }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              BeeCertify
            </Typography>

            <Button color={"inherit"} variant={page === "courses" && "outlined"} onClick={() => setPage('courses')}>Courses</Button>
            <Button color={"inherit"} variant={page === "certificates" && "outlined"} onClick={() => setPage('certificates')}>My Certificates</Button>
            <Button color={"inherit"} variant={page === "verify" && "outlined"} onClick={() => setPage('verify')} sx={{mr: 2}}>Verify</Button>

            <p>
              account: { account.substring(0, 20) }... <br/>
              balance: { balance / 1e18 } ETH
            </p>
            {/* <Button color="inherit">Login</Button> */}
          </Toolbar>
        </AppBar>

      <Container maxWidth="md">

        {/* <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 2, sm: 3, md: 12 }}
          style={{ marginBottom: "20px" }}>
          {properties && properties.map((item, index) => item.owner !== account && (
            <Grid item xs={2} sm={4} md={4} key={index}>
              <Item>
                <Typography variant="h6" gutterBottom component="div">
                  Property #{item.id}
                </Typography>
                Price: {item.price} <br/>
                Location: {item.location} <br/>
                Size: {item.size} <br/>
                {item.available && 
                <Button variant="outlined" size="small" onClick={() => buyProperty(item.id, item.price)}>
                  Buy
                </Button>}
              </Item>
            </Grid>
          ))}
        </Grid> */}

        {content}

        {/* <Typography variant="h4" gutterBottom component="div">
          Owned Properties
        </Typography>
        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}
          style={{ marginBottom: "20px" }}>
          {properties && properties.map((item, index) => item.owner === account && 
            (<Grid item xs={2} sm={4} md={4} key={index}>
              <Item>
                <Typography variant="h6" gutterBottom component="div">
                  Property #{item.id}
                </Typography>
                Price: {item.price} <br/>
                Location: {item.location} <br/>
                Size: {item.size} <br/>
                {item.available ? 
                <Button variant="outlined" size="small" onClick={() => setPropertyAvailability(item.id, false)}>
                  Available
                </Button>: 
                <Button variant="outlined" color="error" size="small" onClick={() => setPropertyAvailability(item.id, true)}>
                  Unavailable
              </Button>}
              </Item>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" gutterBottom component="div">
          Purchases
        </Typography>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Property Id</TableCell>
                <TableCell align="right">Buyer</TableCell>
                <TableCell align="right">Owner</TableCell>
                <TableCell align="right">Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchases && purchases.map((item) => (
                <TableRow
                  key={item.pid}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {item.pid}
                  </TableCell>
                  <TableCell align="right">{item.buyer.substring(0, 15)}...</TableCell>
                  <TableCell align="right">{item.owner.substring(0, 15)}...</TableCell>
                  <TableCell align="right">{item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> */}
      </Container>
      </Box>
    </div>
  );
}

export default App;
