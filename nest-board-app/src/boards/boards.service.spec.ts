import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepository } from 'typeorm';
import { BoardStatus } from './board-status.enum';
import { Board } from './board.entity';
import { BoardRepository } from './board.repository';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';

describe('BoardsService', () => {
  let boardService: BoardsService;
  let boardRepository: BoardRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsService, BoardRepository],
    }).compile();

    boardService = module.get<BoardsService>(BoardsService);
    boardRepository = module.get<BoardRepository>(BoardRepository);
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  describe('findOne', () => {
    it('게시물 ID로 조회', async () => {
      const id: number = 1;

      const result: Board = new Board();
      result.id = 1;
      result.title = "테스트1";
      result.description = "내용11";

      jest.spyOn(boardRepository, 'findOne').mockImplementation(async () => result);

      try {
        await boardService.getBoardById(id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }

      const board = await boardService.getBoardById(id);
      expect(board).toBeInstanceOf(Board);
      expect(board.id).toBe(id);
    });
  });

});
