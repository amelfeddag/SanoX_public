import styled from 'styled-components';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
`;

const GridItem = styled.div`
  border: 1px solid black;
  padding: 20px;
`;

function MyGrid() {
  return (
    <GridContainer>
      <GridItem>Ophtalmologie</GridItem>
      <GridItem>rhumatologie</GridItem>
      <GridItem>neurologie</GridItem>
      <GridItem>cardiologie</GridItem>

    </GridContainer>
  );
}