import { observer } from 'mobx-react-lite';
import { useStore } from '@/store/index';
import { Flex } from '@chakra-ui/react';
import JSONTable from '@/components/JSONTable';
import { useEffect } from 'react';

const CurrentDBTable = observer(() => {
  const {
    w3s: { dbTable }
  } = useStore();

  useEffect(() => {
    dbTable.init();
  }, [dbTable.currentTable]);

  useEffect(() => {
    dbTable.onPageChange();
  }, [dbTable.table.pagination.page]);

  return (
    <>
      <Flex alignItems="center"></Flex>
      <JSONTable jsonstate={dbTable} />
    </>
  );
});

export default CurrentDBTable;